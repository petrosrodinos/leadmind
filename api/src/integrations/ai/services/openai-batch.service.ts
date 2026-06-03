import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { OpenAiBatchCreateResult, OpenAiBatchRequest, OpenAiBatchResult } from '../interfaces/openai-batch.interface';

@Injectable()
export class OpenAiBatchService {
    private readonly logger = new Logger(OpenAiBatchService.name);
    private readonly client: OpenAI;

    constructor(private readonly configService: ConfigService) {
        this.client = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async createBatch(requests: OpenAiBatchRequest[]): Promise<OpenAiBatchCreateResult> {
        const jsonl = requests
            .map((req) =>
                JSON.stringify({
                    custom_id: req.custom_id,
                    method: 'POST',
                    url: '/v1/chat/completions',
                    body: {
                        model: req.model,
                        messages: req.messages,
                        ...(req.response_format ? { response_format: req.response_format } : {}),
                    },
                }),
            )
            .join('\n');

        const buffer = Buffer.from(jsonl, 'utf-8');
        const stream = Readable.from(buffer);
        (stream as any).name = 'batch.jsonl';

        const uploadedFile = await this.client.files.create({
            file: stream as any,
            purpose: 'batch',
        });

        this.logger.log(`Batch file uploaded: ${uploadedFile.id} (${requests.length} requests)`);

        const batch = await this.client.batches.create({
            input_file_id: uploadedFile.id,
            endpoint: '/v1/chat/completions',
            completion_window: '24h',
        });

        this.logger.log(`Batch created: ${batch.id}, expires_at: ${batch.expires_at}`);

        return {
            batch_id: batch.id,
            input_file_id: uploadedFile.id,
            expires_at: batch.expires_at ? new Date(batch.expires_at * 1000) : null,
        };
    }

    async getBatchStatus(batchId: string): Promise<{
        status: string;
        output_file_id: string | null;
        error_file_id: string | null;
        completed_requests: number;
        failed_requests: number;
        total_requests: number;
    }> {
        const batch = await this.client.batches.retrieve(batchId);
        return {
            status: batch.status,
            output_file_id: batch.output_file_id ?? null,
            error_file_id: batch.error_file_id ?? null,
            completed_requests: batch.request_counts?.completed ?? 0,
            failed_requests: batch.request_counts?.failed ?? 0,
            total_requests: batch.request_counts?.total ?? 0,
        };
    }

    async waitForBatchReady(
        batchId: string,
        maxAttempts = 8,
        delayMs = 1500,
    ): Promise<{
        status: string;
        output_file_id: string | null;
        error_file_id: string | null;
        completed_requests: number;
        failed_requests: number;
        total_requests: number;
    }> {
        let last = await this.getBatchStatus(batchId);
        for (let attempt = 1; attempt < maxAttempts; attempt += 1) {
            if (last.output_file_id) {
                return last;
            }
            if (['failed', 'expired', 'cancelled'].includes(last.status)) {
                return last;
            }
            if (last.status !== 'completed' && last.status !== 'finalizing') {
                return last;
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            last = await this.getBatchStatus(batchId);
        }
        return last;
    }

    async getBatchResults(outputFileId: string): Promise<OpenAiBatchResult[]> {
        const fileResponse = await this.client.files.content(outputFileId);
        const text = await fileResponse.text();

        const results: OpenAiBatchResult[] = [];
        for (const line of text.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
                const parsed = JSON.parse(trimmed) as {
                    custom_id?: string;
                    response?: { status_code?: number; body?: unknown };
                    error?: unknown;
                };

                const statusCode = parsed.response?.status_code;
                let body = parsed.response?.body;
                if (typeof body === 'string') {
                    try {
                        body = JSON.parse(body);
                    } catch {
                        body = null;
                    }
                }

                const bodyObj = body as { choices?: Array<{ message?: { content?: string | null } }> } | null;
                const choice = bodyObj?.choices?.[0];
                const content =
                    typeof choice?.message?.content === 'string' ? choice.message.content : null;

                const error =
                    parsed.error != null
                        ? JSON.stringify(parsed.error)
                        : statusCode != null && statusCode >= 400
                          ? JSON.stringify(body ?? { status_code: statusCode })
                          : null;

                results.push({
                    custom_id: String(parsed.custom_id ?? ''),
                    status_code: statusCode ?? 0,
                    content,
                    error,
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'parse error';
                this.logger.warn(`Failed to parse batch output line: ${message}`);
            }
        }

        return results;
    }

    async verifyWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<unknown> {
        const secret = this.configService.get<string>('OPENAI_WEBHOOK_SECRET');
        return this.client.webhooks.unwrap(rawBody, headers, secret);
    }
}
