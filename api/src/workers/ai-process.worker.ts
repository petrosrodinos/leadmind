import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactAiService } from '@/modules/contacts/services/contact-ai.service';
import { LeadEnrichmentOrchestrator } from '@/modules/leads/services/lead-enrichment.orchestrator';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { AiProcessJobData, LeadJobData } from './interfaces/workers.interfaces';
import { ContactJobData } from './interfaces/workers.interfaces';
import {
    isLeadJob,
    resolveContactEnrichmentSources,
    resolveLeadJobEnrichmentSources,
} from './utils/workers.utils';

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
        const sources = resolveLeadJobEnrichmentSources(data);
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
            include: {
                lead: true,
                filter: {
                    include: {
                        filter_scoring_instructions: { include: { scoring_instruction: true } },
                    },
                },
            },
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
                    await this.contactAiService.scoreContact(
                        contact,
                        fresh_lead,
                        filter,
                        data.scoring_instruction_uuids?.length
                            ? { onlyInstructionUuids: data.scoring_instruction_uuids }
                            : undefined,
                    );
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
