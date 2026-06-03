import { Body, Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { OpenAiBatchJobType } from '@/generated/prisma';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { ContactAiService } from '@/modules/contacts/services/contact-ai.service';
import { LeadEnrichmentBatchService } from '@/modules/leads/services/lead-enrichment-batch.service';

@Controller('webhooks/openai')
export class OpenAiWebhookController {
    private readonly logger = new Logger(OpenAiWebhookController.name);

    constructor(
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly contactAiService: ContactAiService,
        private readonly leadEnrichmentBatchService: LeadEnrichmentBatchService,
    ) { }

    @Post()
    @HttpCode(200)
    async handleEvent(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, unknown>,
    ): Promise<void> {
        const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(body);

        let event: any;
        try {
            event = await this.openAiBatchService.verifyWebhookEvent(rawBody, headers);
        } catch (err) {
            this.logger.warn(`Invalid OpenAI webhook signature: ${err.message}`);
            return;
        }

        this.logger.log(`OpenAI webhook event received: ${event?.type}`);

        if (event?.type === 'batch.completed') {
            const batchId = event.data?.id as string | undefined;
            if (!batchId) return;

            try {
                const job =
                    (await this.contactAiService.findBatchJob(batchId)) ??
                    (await this.leadEnrichmentBatchService.findBatchJob(batchId));
                if (job?.type === OpenAiBatchJobType.LEAD_ENRICH) {
                    await this.leadEnrichmentBatchService.processBatchResults(batchId);
                } else if (job?.type === OpenAiBatchJobType.MESSAGE_CREATE) {
                    await this.contactAiService.processBatchMessageCreateResults(batchId);
                } else {
                    await this.contactAiService.processBatchScoreResults(batchId);
                }
            } catch (err) {
                this.logger.error(`Failed to process batch ${batchId}: ${err.message}`);
            }
        }
    }
}
