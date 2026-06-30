import { Injectable, Logger } from '@nestjs/common';
import { embed, generateObject, generateText, streamText } from 'ai';
import {
    AICostResponse,
    AIGenerateObjectResponse,
    AIGenerateOptions,
    AIGenerateTextResponse,
    AIStreamTextOptions,
} from '../interfaces/ai.interface';
import { AiConfig } from '../utils/ai.config';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { calculateAiCost } from '../utils/ai-cost';

@Injectable()
export class AiService {

    constructor(private readonly aiConfig: AiConfig) { }

    private readonly logger = new Logger(AiService.name);

    async generateText(options: AIGenerateOptions): Promise<AIGenerateTextResponse> {
        try {

            // this.aiConfig.validateProviderAndModel(options.provider, options.model);

            const modelAdapter = this.aiConfig.getModelAdapter(options.provider, options.model);

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
                provider: options.provider,
                model: options.model,
                inputTokens: usage.promptTokens,
                outputTokens: usage.completionTokens,
            });

            return {
                response: text,
                usage: cost,
            };
        } catch (error) {
            this.logger.error(`Error generating text: ${error.message}`);
            throw new Error(`Failed to generate text: ${error.message}`);
        }
    }

    async generateTextWithOpenAiWebSearch(options: AIGenerateOptions): Promise<AIGenerateTextResponse> {
        try {
            const model = options.model ?? 'gpt-4o-mini';
            const modelAdapter = openai.responses(model);

            const { text, usage, sources } = await generateText({
                prompt: options.prompt,
                model: modelAdapter,
                system: options?.system || 'You are a helpful assistant.',
                maxTokens: options.maxTokens,
                tools: {
                    web_search_preview: openai.tools.webSearchPreview(),
                },
                toolChoice: { type: 'tool', toolName: 'web_search_preview' },
            });

            const cost = calculateAiCost({
                provider: 'openai',
                model,
                inputTokens: usage.promptTokens,
                outputTokens: usage.completionTokens,
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
            this.logger.error(`Error generating text with OpenAI web search: ${error.message}`);
            throw new Error(`Failed to generate text with OpenAI web search: ${error.message}`);
        }
    }


    async generateObjectWithSchema<T>(options: AIGenerateOptions & { schema: z.ZodSchema<T> }): Promise<{ response: T; usage: AICostResponse }> {
        const maxRetries = 3;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const modelAdapter = this.aiConfig.getModelAdapter(options.provider, options.model);

                const { object, usage } = await generateObject({
                    model: modelAdapter,
                    schema: options.schema,
                    prompt: options.prompt,
                    system: options?.system || 'You are a helpful assistant.',
                    temperature: options.temperature,
                    maxTokens: options.maxTokens,
                });

                const cost = calculateAiCost({
                    provider: options.provider,
                    model: options.model,
                    inputTokens: usage.promptTokens,
                    outputTokens: usage.completionTokens,
                });

                return {
                    response: object,
                    usage: cost,
                };
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    this.logger.warn(`Schema validation error on attempt ${attempt}, retrying... Error: ${error.message}`);
                    continue;
                }

                this.logger.error(`Error generating object on attempt ${attempt}: ${error.message}`);
                throw new Error(`Failed to generate object: ${error.message}`);
            }
        }

        throw lastError || new Error('Failed to generate object after all retry attempts');
    }

    async generateTextWithSchema(options: AIGenerateOptions): Promise<AIGenerateObjectResponse> {
        const maxRetries = 3;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const modelAdapter = this.aiConfig.getModelAdapter(options.provider, options.model);

                const { object, usage } = await generateObject({
                    model: modelAdapter,
                    output: 'array',
                    schema: options?.schema || z.any(),
                    prompt: options.prompt,
                    system: options?.system || 'You are a helpful assistant.',
                });

                const cost = calculateAiCost({
                    provider: options.provider,
                    model: options.model,
                    inputTokens: usage.promptTokens,
                    outputTokens: usage.completionTokens,
                });

                return {
                    response: object,
                    usage: cost,
                };

            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    this.logger.warn(`Schema validation error on attempt ${attempt}, retrying... Error: ${error.message}`);
                    continue;
                }

                this.logger.error(`Error generating text on attempt ${attempt}: ${error.message}`);
                throw new Error(`Failed to generate text: ${error.message}`);
            }
        }

        throw lastError || new Error('Failed to generate text after all retry attempts');
    }

    async streamText(options: AIStreamTextOptions): Promise<void> {
        try {

            this.aiConfig.validateProviderAndModel(options.provider, options.model);

            const modelAdapter = this.aiConfig.getModelAdapter(options.provider, options.model);

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
            this.logger.error(`Error streaming text: ${error.message}`, error.stack);
            throw new Error(`Failed to stream text: ${error.message}`);
        }
    }

    async embedText(text: string): Promise<number[]> {
        const embeddingModel = openai.embedding('text-embedding-3-small');
        const { embedding } = await embed({
            model: embeddingModel,
            value: text,
        });
        return embedding;
    }


}
