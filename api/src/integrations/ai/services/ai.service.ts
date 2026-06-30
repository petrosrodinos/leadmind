import { Injectable, Logger } from '@nestjs/common';
import { embed, generateObject, generateText, streamText } from 'ai';
import { AiUsageStatus } from '@/generated/prisma';
import {
    AICostResponse,
    AIGenerateObjectResponse,
    AIGenerateOptions,
    AIGenerateTextResponse,
    AIStreamTextOptions,
    AiProviders,
} from '../interfaces/ai.interface';
import { AiConfig } from '../utils/ai.config';
import { z } from 'zod';
import { calculateAiCost } from '../utils/ai-cost';
import { AiUsageService } from '@/modules/ai-usage/ai-usage.service';

@Injectable()
export class AiService {
    constructor(
        private readonly aiConfig: AiConfig,
        private readonly aiUsageService: AiUsageService,
    ) {}

    private readonly logger = new Logger(AiService.name);

    async generateText(options: AIGenerateOptions): Promise<AIGenerateTextResponse> {
        const startedAt = Date.now();
        const provider = options.provider ?? AiProviders.openai;
        const model = options.model ?? 'gpt-4o';

        try {
            const modelAdapter = await this.aiConfig.getModelAdapter(options.user_uuid, provider, model);

            const { text, usage } = await generateText({
                prompt: options.prompt,
                model: modelAdapter,
                system: options?.system || 'You are a helpful assistant.',
                temperature: options.temperature,
                maxTokens: options.maxTokens,
                topP: options.topP,
                frequencyPenalty: options.frequencyPenalty,
                presencePenalty: options.presencePenalty,
            });

            const cost = calculateAiCost({
                provider,
                model,
                inputTokens: usage.promptTokens,
                outputTokens: usage.completionTokens,
            });

            this.aiUsageService.logFromSyncCall({
                user_uuid: options.user_uuid,
                provider,
                model,
                usage: cost,
                usageContext: options.usage,
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.SUCCESS,
            });

            return {
                response: text,
                usage: cost,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.aiUsageService.logFromSyncCall({
                user_uuid: options.user_uuid,
                provider,
                model,
                usageContext: options.usage,
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.ERROR,
                error_message: message,
            });
            this.logger.error(`Error generating text: ${message}`);
            throw new Error(`Failed to generate text: ${message}`);
        }
    }

    async generateTextWithOpenAiWebSearch(options: AIGenerateOptions): Promise<AIGenerateTextResponse> {
        const startedAt = Date.now();
        const model = options.model ?? 'gpt-4o-mini';

        try {
            const openAi = await this.aiConfig.getOpenAiProvider(options.user_uuid);
            const modelAdapter = openAi.responses(model);

            const { text, usage, sources } = await generateText({
                prompt: options.prompt,
                model: modelAdapter,
                system: options?.system || 'You are a helpful assistant.',
                maxTokens: options.maxTokens,
                tools: {
                    web_search_preview: openAi.tools.webSearchPreview(),
                },
                toolChoice: { type: 'tool', toolName: 'web_search_preview' },
            });

            const cost = calculateAiCost({
                provider: 'openai',
                model,
                inputTokens: usage.promptTokens,
                outputTokens: usage.completionTokens,
            });

            this.aiUsageService.logFromSyncCall({
                user_uuid: options.user_uuid,
                provider: AiProviders.openai,
                model,
                usage: cost,
                usageContext: options.usage,
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.SUCCESS,
            });

            return {
                response: text,
                usage: cost,
                sources: sources?.map((source) => ({
                    type: source.sourceType,
                    url: 'url' in source ? source.url : undefined,
                    title: 'title' in source ? source.title : undefined,
                })),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.aiUsageService.logFromSyncCall({
                user_uuid: options.user_uuid,
                provider: AiProviders.openai,
                model,
                usageContext: options.usage,
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.ERROR,
                error_message: message,
            });
            this.logger.error(`Error generating text with OpenAI web search: ${message}`);
            throw new Error(`Failed to generate text with OpenAI web search: ${message}`);
        }
    }

    async generateObjectWithSchema<T>(
        options: AIGenerateOptions & { schema: z.ZodSchema<T> },
    ): Promise<{ response: T; usage: AICostResponse }> {
        const maxRetries = 3;
        let lastError: Error | undefined;
        const provider = options.provider ?? AiProviders.openai;
        const model = options.model ?? 'gpt-4o';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const startedAt = Date.now();
            try {
                const modelAdapter = await this.aiConfig.getModelAdapter(options.user_uuid, provider, model);

                const { object, usage } = await generateObject({
                    model: modelAdapter,
                    schema: options.schema,
                    prompt: options.prompt,
                    system: options?.system || 'You are a helpful assistant.',
                    temperature: options.temperature,
                    maxTokens: options.maxTokens,
                });

                const cost = calculateAiCost({
                    provider,
                    model,
                    inputTokens: usage.promptTokens,
                    outputTokens: usage.completionTokens,
                });

                this.aiUsageService.logFromSyncCall({
                    user_uuid: options.user_uuid,
                    provider,
                    model,
                    usage: cost,
                    usageContext: options.usage,
                    duration_ms: Date.now() - startedAt,
                    status: AiUsageStatus.SUCCESS,
                });

                return {
                    response: object,
                    usage: cost,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt < maxRetries) {
                    this.logger.warn(
                        `Schema validation error on attempt ${attempt}, retrying... Error: ${lastError.message}`,
                    );
                    continue;
                }

                this.aiUsageService.logFromSyncCall({
                    user_uuid: options.user_uuid,
                    provider,
                    model,
                    usageContext: options.usage,
                    duration_ms: Date.now() - startedAt,
                    status: AiUsageStatus.ERROR,
                    error_message: lastError.message,
                });
                this.logger.error(`Error generating object on attempt ${attempt}: ${lastError.message}`);
                throw new Error(`Failed to generate object: ${lastError.message}`);
            }
        }

        throw lastError || new Error('Failed to generate object after all retry attempts');
    }

    async generateTextWithSchema(options: AIGenerateOptions): Promise<AIGenerateObjectResponse> {
        const maxRetries = 3;
        let lastError: Error | undefined;
        const provider = options.provider ?? AiProviders.openai;
        const model = options.model ?? 'gpt-4o';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const startedAt = Date.now();
            try {
                const modelAdapter = await this.aiConfig.getModelAdapter(options.user_uuid, provider, model);

                const { object, usage } = await generateObject({
                    model: modelAdapter,
                    output: 'array',
                    schema: options?.schema || z.any(),
                    prompt: options.prompt,
                    system: options?.system || 'You are a helpful assistant.',
                });

                const cost = calculateAiCost({
                    provider,
                    model,
                    inputTokens: usage.promptTokens,
                    outputTokens: usage.completionTokens,
                });

                this.aiUsageService.logFromSyncCall({
                    user_uuid: options.user_uuid,
                    provider,
                    model,
                    usage: cost,
                    usageContext: options.usage,
                    duration_ms: Date.now() - startedAt,
                    status: AiUsageStatus.SUCCESS,
                });

                return {
                    response: object,
                    usage: cost,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt < maxRetries) {
                    this.logger.warn(
                        `Schema validation error on attempt ${attempt}, retrying... Error: ${lastError.message}`,
                    );
                    continue;
                }

                this.aiUsageService.logFromSyncCall({
                    user_uuid: options.user_uuid,
                    provider,
                    model,
                    usageContext: options.usage,
                    duration_ms: Date.now() - startedAt,
                    status: AiUsageStatus.ERROR,
                    error_message: lastError.message,
                });
                this.logger.error(`Error generating text on attempt ${attempt}: ${lastError.message}`);
                throw new Error(`Failed to generate text: ${lastError.message}`);
            }
        }

        throw lastError || new Error('Failed to generate text after all retry attempts');
    }

    async streamText(options: AIStreamTextOptions): Promise<void> {
        try {
            this.aiConfig.validateProviderAndModel(options.provider ?? AiProviders.openai, options.model ?? 'gpt-4o');

            const modelAdapter = await this.aiConfig.getModelAdapter(
                options.user_uuid,
                options.provider,
                options.model,
            );

            const stream = await streamText({
                model: modelAdapter,
                system: options.system,
                prompt: options.prompt,
                temperature: options.temperature,
                maxTokens: options.maxTokens,
                topP: options.topP,
                frequencyPenalty: options.frequencyPenalty,
                presencePenalty: options.presencePenalty,
            });

            let fullText = '';

            for await (const chunk of stream.textStream) {
                if (options.onToken) {
                    options.onToken(chunk);
                }
                fullText += chunk;
            }

            if (options.onComplete) {
                options.onComplete(fullText);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error streaming text: ${message}`, error instanceof Error ? error.stack : undefined);
            throw new Error(`Failed to stream text: ${message}`);
        }
    }

    async embedText(user_uuid: string, text: string, usageContext?: AIGenerateOptions['usage']): Promise<number[]> {
        const startedAt = Date.now();
        const model = 'text-embedding-3-small';

        try {
            const openAi = await this.aiConfig.getOpenAiProvider(user_uuid);
            const embeddingModel = openAi.embedding(model);
            const { embedding, usage } = await embed({
                model: embeddingModel,
                value: text,
            });

            const cost = calculateAiCost({
                provider: AiProviders.openai,
                model,
                inputTokens: usage?.tokens ?? 0,
                outputTokens: 0,
            });

            this.aiUsageService.logFromSyncCall({
                user_uuid,
                provider: AiProviders.openai,
                model,
                usage: cost,
                usageContext: { ...usageContext, operation: usageContext?.operation ?? 'EMBEDDING' },
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.SUCCESS,
            });

            return embedding;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.aiUsageService.logFromSyncCall({
                user_uuid,
                provider: AiProviders.openai,
                model,
                usageContext: { ...usageContext, operation: usageContext?.operation ?? 'EMBEDDING' },
                duration_ms: Date.now() - startedAt,
                status: AiUsageStatus.ERROR,
                error_message: message,
            });
            throw error;
        }
    }
}
