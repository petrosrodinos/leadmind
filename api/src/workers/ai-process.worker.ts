import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EnrichmentSource } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactAiService } from '@/modules/contacts/services/contact-ai.service';
import { DEFAULT_ENRICHMENT_SOURCES } from '@/modules/leads/constants/enrichment.constants';
import { LeadEnrichmentOrchestrator } from '@/modules/leads/services/lead-enrichment.orchestrator';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';

type AiProcessAction = 'enrich' | 'score' | 'draft';

interface ContactJobData {
    contact_uuid: string;
    action?: AiProcessAction;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
}

interface LeadJobData {
    lead_uuid: string;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
}

type AiProcessJobData = ContactJobData | LeadJobData;

const isLeadJob = (data: AiProcessJobData): data is LeadJobData =>
    'lead_uuid' in data && data.lead_uuid != null;

function resolveContactEnrichmentSources(
    job: ContactJobData,
    filter: { enrichment_sources: EnrichmentSource[] } | null | undefined,
): EnrichmentSource[] {
    if (Array.isArray(job.enrichment_sources)) {
        return job.enrichment_sources;
    }
    if (filter?.enrichment_sources?.length) {
        return filter.enrichment_sources;
    }
    return [];
}

@Processor(AI_PROCESS_QUEUE, { concurrency: 5 })
export class AiProcessWorker extends WorkerHost {
    private readonly logger = new Logger(AiProcessWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly contactAiService: ContactAiService,
        private readonly leadEnrichmentOrchestrator: LeadEnrichmentOrchestrator,
    ) {
        super();
    }

    async process(job: Job<AiProcessJobData>): Promise<void> {
        if (isLeadJob(job.data)) {
            await this.processLeadJob(job.data);
            return;
        }
        await this.processContactJob(job.data);
    }

    private async processLeadJob(data: LeadJobData): Promise<void> {
        const lead = await this.prisma.lead.findUnique({ where: { uuid: data.lead_uuid } });
        if (!lead) {
            this.logger.warn(`Lead ${data.lead_uuid} not found — skipping enrichment`);
            return;
        }
        const sources = data.enrichment_sources?.length
            ? data.enrichment_sources
            : DEFAULT_ENRICHMENT_SOURCES;
        try {
            await this.leadEnrichmentOrchestrator.run(data.lead_uuid, sources, {
                force: data.force_enrichment ?? false,
            });
        } catch (error) {
            this.logger.error(`Lead ${lead.uuid} enrichment failed: ${this.errMsg(error)}`);
        }
    }

    private async processContactJob(data: ContactJobData): Promise<void> {
        const contact = await this.prisma.contact.findUnique({
            where: { uuid: data.contact_uuid },
            include: { lead: true, filter: true },
        });
        if (!contact) {
            this.logger.warn(`Contact ${data.contact_uuid} not found — skipping`);
            return;
        }

        const { lead, filter } = contact;
        const action = data.action;
        const full_pipeline = action === undefined;
        const sources = resolveContactEnrichmentSources(data, filter);

        if (full_pipeline || action === 'enrich') {
            try {
                await this.leadEnrichmentOrchestrator.run(lead.uuid, sources, {
                    force: data.force_enrichment ?? false,
                });
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} enrich step failed: ${this.errMsg(error)}`);
            }
        }

        if ((full_pipeline || action === 'score') && filter) {
            try {
                const fresh_lead = await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } });
                if (fresh_lead) {
                    await this.contactAiService.scoreContact(contact, fresh_lead, filter);
                }
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} score step failed: ${this.errMsg(error)}`);
            }
        } else if ((full_pipeline || action === 'score') && !filter) {
            this.logger.warn(`Contact ${contact.uuid} has no filter — skipping score`);
        }

        if ((full_pipeline || action === 'draft') && filter) {
            try {
                const fresh_lead = await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } });
                if (fresh_lead) {
                    await this.contactAiService.draftOutreachMessages(contact, fresh_lead, filter);
                }
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} draft step failed: ${this.errMsg(error)}`);
            }
        } else if ((full_pipeline || action === 'draft') && !filter) {
            this.logger.warn(`Contact ${contact.uuid} has no filter — skipping draft`);
        }
    }

    private errMsg(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
