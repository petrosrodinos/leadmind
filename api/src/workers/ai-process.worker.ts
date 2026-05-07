import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { LeadAiService } from '@/modules/leads/utils/lead-ai.service';
import { ContactAiService } from '@/modules/contacts/services/contact-ai.service';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';

type AiProcessAction = 'enrich' | 'score' | 'draft';

interface ContactJobData {
    contact_uuid: string;
    action?: AiProcessAction;
}

interface LeadJobData {
    lead_uuid: string;
    action: 'enrich';
}

type AiProcessJobData = ContactJobData | LeadJobData;

const isLeadJob = (data: AiProcessJobData): data is LeadJobData =>
    'lead_uuid' in data && data.lead_uuid != null;

@Processor(AI_PROCESS_QUEUE, { concurrency: 5 })
export class AiProcessWorker extends WorkerHost {
    private readonly logger = new Logger(AiProcessWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly leadAiService: LeadAiService,
        private readonly contactAiService: ContactAiService,
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
        try {
            await this.leadAiService.enrichLead(lead);
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
        if (!contact.filter) {
            this.logger.warn(`Contact ${contact.uuid} has no filter — skipping`);
            return;
        }

        const { lead, filter } = contact;
        const action = data.action;

        if (!action || action === 'enrich') {
            try {
                await this.leadAiService.enrichLead(lead);
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} enrich step failed: ${this.errMsg(error)}`);
            }
        }

        if (!action || action === 'score') {
            try {
                const fresh_lead = await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } });
                if (fresh_lead) {
                    await this.contactAiService.scoreContact(contact, fresh_lead, filter);
                }
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} score step failed: ${this.errMsg(error)}`);
            }
        }

        if (!action || action === 'draft') {
            try {
                const fresh_lead = await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } });
                if (fresh_lead) {
                    await this.contactAiService.draftOutreachMessages(contact, fresh_lead, filter);
                }
            } catch (error) {
                this.logger.error(`Contact ${contact.uuid} draft step failed: ${this.errMsg(error)}`);
            }
        }
    }

    private errMsg(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
