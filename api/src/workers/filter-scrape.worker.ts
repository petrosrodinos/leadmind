import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Filter, JobStatus, JobTrigger, Prisma, SourceType, ApifyUsageOperation } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ApifyService } from '@/integrations/apify/apify.service';
import { GemiService } from '@/integrations/gemi/gemi.service';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { NormalizedLead } from '@/integrations/apify/interfaces/apify.interfaces';
import { contactProfileFromLead } from '@/modules/contacts/utils/contact-profile.utils';
import {
    findOwnedContactByEmail,
    ensureContactFilterLink,
    linkContactToFilter,
} from '@/modules/contacts/utils/contact-filter-link.utils';
import { resolveLeadWebsite } from '@/modules/leads/utils/lead-website.utils';
import {
    AI_PROCESS_QUEUE,
    FILTER_SCRAPE_LOCK_DURATION_MS,
    FILTER_SCRAPE_QUEUE,
} from '@/core/queues/queues.constants';
import {
    abortFilterScrape,
    beginFilterScrapeCancel,
    endFilterScrapeCancel,
} from '@/workers/utils/filter-scrape-cancel.registry';

interface FilterScrapeJobData {
    filter_uuid: string;
    manual?: boolean;
}

interface PersistLeadsResult {
    new_contact_uuids: string[];
    leads_processed: number;
}

@Processor(FILTER_SCRAPE_QUEUE, {
    concurrency: 3,
    lockDuration: FILTER_SCRAPE_LOCK_DURATION_MS,
})
export class FilterScrapeWorker extends WorkerHost {
    private readonly logger = new Logger(FilterScrapeWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly apifyService: ApifyService,
        private readonly gemiService: GemiService,
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

        const cancelSignal = beginFilterScrapeCancel(filter.uuid);
        if (cancelSignal.aborted) {
            endFilterScrapeCancel(filter.uuid, cancelSignal);
            this.logger.warn(`Filter ${filter.uuid} stop requested — skipping job ${job.id}`);
            return null;
        }

        await this.prisma.filterJob.updateMany({
            where: { filter_uuid: filter.uuid, status: JobStatus.RUNNING },
            data: {
                status: JobStatus.FAILED,
                error: 'Superseded by a newer run',
                completed_at: new Date(),
            },
        });

        const filter_job = await this.prisma.filterJob.create({
            data: {
                filter_uuid: filter.uuid,
                status: JobStatus.RUNNING,
                trigger: manual ? JobTrigger.MANUAL : JobTrigger.SCHEDULED,
                started_at: new Date(),
            },
        });

        if (cancelSignal.aborted || (await this.isCancelled(filter_job.uuid))) {
            await this.markCancelled(filter_job.uuid);
            endFilterScrapeCancel(filter.uuid, cancelSignal);
            this.logger.warn(`Filter ${filter.uuid} cancelled before scrape start`);
            return null;
        }

        let status: JobStatus = JobStatus.COMPLETED;
        let leads_found = 0;
        let new_contacts = 0;
        let error_message: string | undefined;
        const cancelPoll = setInterval(() => {
            void this.isCancelled(filter_job.uuid).then((cancelled) => {
                if (cancelled) {
                    abortFilterScrape(filter.uuid);
                }
            });
        }, 1500);

        try {
            if (cancelSignal.aborted || (await this.isCancelled(filter_job.uuid))) {
                abortFilterScrape(filter.uuid);
                await this.markCancelled(filter_job.uuid);
                return null;
            }

            const normalized_leads = filter.source_type === SourceType.GEMI
                ? await this.gemiService.scrapeLeads(
                    filter.query_config as Record<string, any>,
                    cancelSignal,
                )
                : await this.apifyService.scrapeLeads(
                    filter.user_uuid,
                    filter.source_type,
                    filter.query_config as Record<string, any>,
                    {
                        operation: ApifyUsageOperation.FILTER_SCRAPE,
                        reference_type: 'filter',
                        reference_uuid: filter.uuid,
                        metadata: { source_type: filter.source_type },
                    },
                    cancelSignal,
                );

            if (cancelSignal.aborted || (await this.isCancelled(filter_job.uuid))) {
                this.logger.warn(
                    `Filter ${filter.uuid} cancelled after scrape — skipping persist`,
                );
                await this.markCancelled(filter_job.uuid);
                return null;
            }

            const { new_contact_uuids, leads_processed } = await this.persistLeads(
                filter,
                normalized_leads,
            );
            leads_found = leads_processed;
            new_contacts = new_contact_uuids.length;

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

            this.logger.log(
                `Filter ${filter.uuid} scrape complete — ${leads_found} leads processed, ${new_contacts} new contacts`,
            );

            return { filter_job_uuid: filter_job.uuid, new_contacts };
        } catch (error) {
            if (this.isAbortError(error) || cancelSignal.aborted) {
                await this.markCancelled(filter_job.uuid);
                this.logger.warn(`Filter ${filter.uuid} scrape aborted by user`);
                return null;
            }
            status = JobStatus.FAILED;
            error_message = (error instanceof Error ? error.message : 'Unknown error').slice(0, 1000);
            this.logger.error(`Filter ${filter.uuid} scrape failed: ${error_message}`);
            throw error;
        } finally {
            clearInterval(cancelPoll);
            endFilterScrapeCancel(filter.uuid, cancelSignal);
            const duration = Date.now() - filter_job.started_at.getTime();
            const keptCancelled = await this.prisma.filterJob.updateMany({
                where: {
                    uuid: filter_job.uuid,
                    status: JobStatus.CANCELLED,
                },
                data: {
                    leads_found,
                    duration,
                    completed_at: new Date(),
                },
            });
            if (keptCancelled.count === 0) {
                await this.prisma.filterJob.updateMany({
                    where: {
                        uuid: filter_job.uuid,
                        status: { not: JobStatus.CANCELLED },
                    },
                    data: {
                        status,
                        leads_found,
                        error: error_message,
                        completed_at: new Date(),
                        duration,
                    },
                });
            } else {
                this.logger.warn(
                    `Filter ${filter.uuid} scrape finished after cancel — keeping CANCELLED status`,
                );
            }
        }
    }

    private async isCancelled(filter_job_uuid: string): Promise<boolean> {
        const current = await this.prisma.filterJob.findUnique({
            where: { uuid: filter_job_uuid },
            select: { status: true },
        });
        return current?.status === JobStatus.CANCELLED;
    }

    private async markCancelled(filter_job_uuid: string): Promise<void> {
        await this.prisma.filterJob.updateMany({
            where: {
                uuid: filter_job_uuid,
                status: { in: [JobStatus.PENDING, JobStatus.RUNNING] },
            },
            data: {
                status: JobStatus.CANCELLED,
                error: 'Stopped by user',
                completed_at: new Date(),
            },
        });
    }

    private isAbortError(error: unknown): boolean {
        if (!error || typeof error !== 'object') return false;
        const message = error instanceof Error ? error.message : String(error);
        return /aborted|canceled|cancelled/i.test(message);
    }

    private async persistLeads(
        filter: Filter,
        normalized_leads: NormalizedLead[],
    ): Promise<PersistLeadsResult> {
        const new_contact_uuids: string[] = [];
        let leads_processed = 0;

        for (const normalized of normalized_leads) {
            if (!normalized.email && !normalized.phone) continue;
            leads_processed++;

            const raw_lead = await this.prisma.rawLead.create({
                data: {
                    filter_uuid: filter.uuid,
                    source_type: filter.source_type,
                    raw_data: normalized.raw_data as Prisma.InputJsonValue,
                },
            });

            const dedup_where = normalized.email
                ? { email: normalized.email }
                : normalized.phone
                    ? { phone: normalized.phone }
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

            let existing_contact =
                normalized.email
                    ? await findOwnedContactByEmail(
                          this.prisma,
                          filter.user_uuid,
                          normalized.email,
                      )
                    : null;

            if (!existing_contact) {
                existing_contact = await this.prisma.contact.findUnique({
                    where: {
                        user_uuid_lead_uuid: {
                            user_uuid: filter.user_uuid,
                            lead_uuid: lead.uuid,
                        },
                    },
                });
            }

            if (existing_contact) {
                await linkContactToFilter(this.prisma, existing_contact, filter.uuid);
                if (existing_contact.lead_uuid !== lead.uuid) {
                    const conflict = await this.prisma.contact.findUnique({
                        where: {
                            user_uuid_lead_uuid: {
                                user_uuid: filter.user_uuid,
                                lead_uuid: lead.uuid,
                            },
                        },
                    });
                    if (!conflict) {
                        await this.prisma.contact.update({
                            where: { uuid: existing_contact.uuid },
                            data: {
                                lead_uuid: lead.uuid,
                                ...contactProfileFromLead(lead),
                            },
                        });
                    } else {
                        await this.prisma.contact.update({
                            where: { uuid: existing_contact.uuid },
                            data: contactProfileFromLead(lead),
                        });
                    }
                } else if (!is_new_lead) {
                    await this.prisma.contact.update({
                        where: { uuid: existing_contact.uuid },
                        data: contactProfileFromLead(lead),
                    });
                }
                await this.reindexContactsForLead(lead.uuid);
            } else {
                try {
                    const contact = await this.prisma.contact.create({
                        data: {
                            user_uuid: filter.user_uuid,
                            lead_uuid: lead.uuid,
                            filter_uuid: filter.uuid,
                            ...contactProfileFromLead(lead),
                        },
                    });
                    await ensureContactFilterLink(this.prisma, contact.uuid, filter.uuid);
                    await this.elasticsearchService.indexContact({ ...contact, lead, tags: [] });
                    new_contact_uuids.push(contact.uuid);
                } catch (error) {
                    if (
                        !(
                            error instanceof Prisma.PrismaClientKnownRequestError &&
                            error.code === 'P2002'
                        )
                    ) {
                        throw error;
                    }
                    const raced =
                        (normalized.email
                            ? await findOwnedContactByEmail(
                                  this.prisma,
                                  filter.user_uuid,
                                  normalized.email,
                              )
                            : null) ??
                        (await this.prisma.contact.findUnique({
                            where: {
                                user_uuid_lead_uuid: {
                                    user_uuid: filter.user_uuid,
                                    lead_uuid: lead.uuid,
                                },
                            },
                        }));
                    if (!raced) throw error;
                    await linkContactToFilter(this.prisma, raced, filter.uuid);
                    await this.reindexContactsForLead(lead.uuid);
                }
            }

            await this.prisma.rawLead.update({
                where: { uuid: raw_lead.uuid },
                data: { processed_at: new Date() },
            });
        }

        return { new_contact_uuids, leads_processed };
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
            website: resolveLeadWebsite(normalized.website, normalized.email),
            google_maps_url: normalized.google_maps_url ?? null,
            linkedin_url: normalized.linkedin_url ?? null,
            title: normalized.title ?? null,
            location: normalized.location ?? null,
            industry: normalized.industry ?? null,
            description: normalized.description ?? null,
            raw_data: normalized.raw_data as Prisma.InputJsonValue,
        };
    }
}
