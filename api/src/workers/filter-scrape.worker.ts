import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Filter, JobStatus, JobTrigger, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ApifyService } from '@/integrations/apify/apify.service';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { NormalizedLead } from '@/integrations/apify/interfaces/apify.interfaces';
import { contactProfileFromLead } from '@/modules/contacts/utils/contact-profile.utils';
import { AI_PROCESS_QUEUE, FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';

interface FilterScrapeJobData {
    filter_uuid: string;
    manual?: boolean;
}

@Processor(FILTER_SCRAPE_QUEUE, { concurrency: 3 })
export class FilterScrapeWorker extends WorkerHost {
    private readonly logger = new Logger(FilterScrapeWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly apifyService: ApifyService,
        private readonly elasticsearchService: ElasticsearchService,
        @InjectQueue(AI_PROCESS_QUEUE) private readonly aiProcessQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<FilterScrapeJobData>): Promise<{ filter_job_uuid: string; new_contacts: number } | null> {
        const { filter_uuid, manual } = job.data;

        const filter = await this.prisma.filter.findUnique({ where: { uuid: filter_uuid } });
        if (!filter) {
            this.logger.warn(`Filter ${filter_uuid} not found — skipping job ${job.id}`);
            return null;
        }

        const filter_job = await this.prisma.filterJob.create({
            data: {
                filter_uuid: filter.uuid,
                status: JobStatus.RUNNING,
                trigger: manual ? JobTrigger.MANUAL : JobTrigger.SCHEDULED,
                started_at: new Date(),
            },
        });

        try {
            const normalized_leads = await this.apifyService.scrapeLeads(
                filter.source_type,
                filter.query_config as Record<string, any>,
            );

            const new_contact_uuids = await this.persistLeads(filter, normalized_leads);

            for (const contact_uuid of new_contact_uuids) {
                await this.aiProcessQueue.add(
                    `ai-process:${contact_uuid}`,
                    {
                        contact_uuid,
                        enrichment_sources: filter.enrichment_sources,
                    },
                    { removeOnComplete: 100, removeOnFail: 100 },
                );
            }

            await this.prisma.filterJob.update({
                where: { uuid: filter_job.uuid },
                data: {
                    status: JobStatus.COMPLETED,
                    leads_found: new_contact_uuids.length,
                    completed_at: new Date(),
                    duration: Date.now() - filter_job.started_at.getTime(),
                },
            });

            this.logger.log(
                `Filter ${filter.uuid} scrape complete — ${new_contact_uuids.length} new contacts`,
            );

            return { filter_job_uuid: filter_job.uuid, new_contacts: new_contact_uuids.length };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Filter ${filter.uuid} scrape failed: ${message}`);

            await this.prisma.filterJob.update({
                where: { uuid: filter_job.uuid },
                data: {
                    status: JobStatus.FAILED,
                    error: message.slice(0, 1000),
                    completed_at: new Date(),
                    duration: Date.now() - filter_job.started_at.getTime(),
                },
            });

            throw error;
        }
    }

    private async persistLeads(filter: Filter, normalized_leads: NormalizedLead[]): Promise<string[]> {
        const new_contact_uuids: string[] = [];

        for (const normalized of normalized_leads) {
            if (!normalized.email && !normalized.linkedin_url) continue;

            const raw_lead = await this.prisma.rawLead.create({
                data: {
                    filter_uuid: filter.uuid,
                    source_type: filter.source_type,
                    raw_data: normalized.raw_data as Prisma.InputJsonValue,
                },
            });

            const dedup_where = normalized.email
                ? { email: normalized.email }
                : { linkedin_url: normalized.linkedin_url };

            const lead_data = this.mapToLead(normalized);

            let lead = await this.prisma.lead.findFirst({ where: dedup_where });
            const is_new_lead = !lead;
            if (!lead) {
                lead = await this.prisma.lead.create({
                    data: {
                        ...lead_data,
                        source_type: filter.source_type,
                        raw_lead: { connect: { uuid: raw_lead.uuid } },
                    },
                });
            } else {
                lead = await this.prisma.lead.update({
                    where: { uuid: lead.uuid },
                    data: lead_data,
                });
            }

            await this.elasticsearchService.indexLead(lead);

            const existing_contact = await this.prisma.contact.findUnique({
                where: {
                    user_uuid_lead_uuid: {
                        user_uuid: filter.user_uuid,
                        lead_uuid: lead.uuid,
                    },
                },
            });

            if (!existing_contact) {
                const contact = await this.prisma.contact.create({
                    data: {
                        user_uuid: filter.user_uuid,
                        lead_uuid: lead.uuid,
                        filter_uuid: filter.uuid,
                        ...contactProfileFromLead(lead),
                    },
                });
                await this.elasticsearchService.indexContact({ ...contact, lead, tags: [] });
                new_contact_uuids.push(contact.uuid);
            } else if (!is_new_lead) {
                await this.reindexContactsForLead(lead.uuid);
            }

            await this.prisma.rawLead.update({
                where: { uuid: raw_lead.uuid },
                data: { processed_at: new Date() },
            });
        }

        return new_contact_uuids;
    }

    private async reindexContactsForLead(lead_uuid: string): Promise<void> {
        const contacts = await this.prisma.contact.findMany({
            where: { lead_uuid },
            include: { lead: true, tags: true },
        });
        for (const contact of contacts) {
            await this.elasticsearchService.indexContact(contact);
        }
    }

    private mapToLead(normalized: NormalizedLead) {
        return {
            name: normalized.name ?? null,
            email: normalized.email ?? null,
            phone: normalized.phone ?? null,
            company: normalized.company ?? null,
            website: normalized.website ?? null,
            linkedin_url: normalized.linkedin_url ?? null,
            title: normalized.title ?? null,
            location: normalized.location ?? null,
            industry: normalized.industry ?? null,
            description: normalized.description ?? null,
            raw_data: normalized.raw_data as Prisma.InputJsonValue,
        };
    }
}
