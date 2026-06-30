import { Body, Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { AiCredentialsService } from '@/integrations/ai/services/ai-credentials.service';
import { OpenAiBatchDispatchService } from './services/openai-batch-dispatch.service';

@Controller('webhooks/openai')
export class OpenAiWebhookController {
    private readonly logger = new Logger(OpenAiWebhookController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly aiCredentials: AiCredentialsService,
        private readonly openAiBatchDispatchService: OpenAiBatchDispatchService,
    ) {}

    @Post()
    @HttpCode(200)
    async handleEvent(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, unknown>,
    ): Promise<void> {
        const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(body);

        let parsedBody: { data?: { id?: string } };
        try {
            parsedBody = JSON.parse(rawBody) as { data?: { id?: string } };
        } catch {
            this.logger.warn('OpenAI webhook: invalid JSON body');
            return;
        }

        const batchId = parsedBody?.data?.id;
        if (!batchId) {
            return;
        }

        const job = await this.prisma.openAiBatchJob.findUnique({ where: { batch_id: batchId } });
        if (!job) {
            this.logger.warn(`OpenAI webhook: no job for batch_id ${batchId}`);
            return;
        }

        const webhookSecret = await this.aiCredentials.tryGetOpenAiWebhookSecret(job.user_uuid);
        if (!webhookSecret) {
            this.logger.warn(`OpenAI webhook: no webhook secret for user ${job.user_uuid}`);
            return;
        }

        let event: { type?: string; data?: { id?: string } };
        try {
            event = (await this.openAiBatchService.verifyWebhookEvent(
                rawBody,
                headers,
                webhookSecret,
            )) as { type?: string; data?: { id?: string } };
        } catch (err) {
            this.logger.warn(
                `Invalid OpenAI webhook signature: ${err instanceof Error ? err.message : err}`,
            );
            return;
        }

        this.logger.log(`OpenAI webhook event received: ${event?.type}`);

        if (event?.type === 'batch.completed') {
            try {
                await this.openAiBatchDispatchService.processBatchCompletion(batchId);
            } catch (err) {
                this.logger.error(
                    `Failed to process batch ${batchId}: ${err instanceof Error ? err.message : err}`,
                );
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
                this.logger.error(
                    `Failed to finalize batch ${batchId}: ${err instanceof Error ? err.message : err}`,
                );
            }
        }
    }
}
