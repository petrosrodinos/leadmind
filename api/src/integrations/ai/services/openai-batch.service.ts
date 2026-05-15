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

    async getBatchResults(outputFileId: string): Promise<OpenAiBatchResult[]> {
        const fileResponse = await this.client.files.content(outputFileId);
        const text = await fileResponse.text();

        return text
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => {
                const parsed = JSON.parse(line);
                const choice = parsed.response?.body?.choices?.[0];
                return {
                    custom_id: parsed.custom_id as string,
                    status_code: parsed.response?.status_code as number,
                    content: choice?.message?.content ?? null,
                    error: parsed.error ? JSON.stringify(parsed.error) : null,
                };
            });
    }

    async verifyWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<unknown> {
        const secret = this.configService.get<string>('OPENAI_WEBHOOK_SECRET');
        return this.client.webhooks.unwrap(rawBody, headers, secret);
    }
}
