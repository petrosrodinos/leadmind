import { Injectable, Logger } from '@nestjs/common';
import { OpenAiBatchJobType, OpenAiBatchStatus } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { ContactAiService } from '@/modules/contacts/services/contact-ai.service';
import { LeadEnrichmentBatchService } from '@/modules/leads/services/lead-enrichment-batch.service';

@Injectable()
export class OpenAiBatchDispatchService {
    private readonly logger = new Logger(OpenAiBatchDispatchService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly contactAiService: ContactAiService,
        private readonly leadEnrichmentBatchService: LeadEnrichmentBatchService,
    ) {}

    async processBatchCompletion(batchId: string): Promise<void> {
        const job = await this.prisma.openAiBatchJob.findUnique({ where: { batch_id: batchId } });
        if (!job) {
            this.logger.warn(`No OpenAiBatchJob record for batch_id: ${batchId}`);
            return;
        }

        if (job.status === OpenAiBatchStatus.COMPLETED) {
            return;
        }

        const batchStatus = await this.openAiBatchService.waitForBatchReady(batchId);

        if (['failed', 'expired', 'cancelled'].includes(batchStatus.status)) {
            await this.prisma.openAiBatchJob.update({
                where: { batch_id: batchId },
                data: {
                    status: this.mapTerminalStatus(batchStatus.status),
                    finished_at: new Date(),
                    output_file_id: batchStatus.output_file_id,
                    error_file_id: batchStatus.error_file_id,
                    completed_requests: batchStatus.completed_requests,
                    failed_requests: batchStatus.failed_requests,
                    total_requests: batchStatus.total_requests,
                },
            });
            this.logger.warn(`Batch ${batchId} ended with OpenAI status: ${batchStatus.status}`);
            return;
        }

        if (!batchStatus.output_file_id) {
            this.logger.warn(
                `Batch ${batchId} not ready for processing (OpenAI status=${batchStatus.status}, no output file)`,
            );
            return;
        }

        switch (job.type) {
            case OpenAiBatchJobType.LEAD_ENRICH:
                await this.leadEnrichmentBatchService.processBatchResults(batchId, batchStatus);
                break;
            case OpenAiBatchJobType.MESSAGE_CREATE:
                await this.contactAiService.processBatchMessageCreateResults(batchId);
                break;
            case OpenAiBatchJobType.CONTACT_SCORE:
                await this.contactAiService.processBatchScoreResults(batchId);
                break;
            default:
                this.logger.warn(`Unknown batch job type for ${batchId}: ${job.type}`);
        }
    }

    private mapTerminalStatus(openAiStatus: string): OpenAiBatchStatus {
        switch (openAiStatus) {
            case 'failed':
                return OpenAiBatchStatus.FAILED;
            case 'expired':
                return OpenAiBatchStatus.EXPIRED;
            case 'cancelled':
                return OpenAiBatchStatus.CANCELLED;
            default:
                return OpenAiBatchStatus.FAILED;
        }
    }
}
