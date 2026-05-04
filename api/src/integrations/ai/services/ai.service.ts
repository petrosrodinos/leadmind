import { Injectable, Logger } from '@nestjs/common';
import { embed, generateObject, generateText, streamText } from 'ai';
import {
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
