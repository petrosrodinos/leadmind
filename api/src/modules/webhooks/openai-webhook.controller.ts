import { Body, Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { OpenAiBatchDispatchService } from './services/openai-batch-dispatch.service';

@Controller('webhooks/openai')
export class OpenAiWebhookController {
    private readonly logger = new Logger(OpenAiWebhookController.name);

    constructor(
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly openAiBatchDispatchService: OpenAiBatchDispatchService,
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

        const batchId = event?.data?.id as string | undefined;
        if (!batchId) return;

        if (event?.type === 'batch.completed') {
            try {
                await this.openAiBatchDispatchService.processBatchCompletion(batchId);
            } catch (err) {
                this.logger.error(`Failed to process batch ${batchId}: ${err.message}`);
            }
            return;
        }

        if (
            event?.type === 'batch.failed' ||
            event?.type === 'batch.expired' ||
            event?.type === 'batch.cancelled'
        ) {
            try {
                await this.openAiBatchDispatchService.processBatchCompletion(batchId);
            } catch (err) {
                this.logger.error(`Failed to finalize batch ${batchId}: ${err.message}`);
            }
        }
    }
}
