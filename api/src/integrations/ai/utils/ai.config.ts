import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { AIModelInfo, AiModels, AiProvider, AiProviders } from '../interfaces/ai.interface';
import {
    DEFAULT_LEAD_ENRICHMENT_AI_PROVIDER,
    isLeadEnrichmentAiProvider,
    LEAD_ENRICHMENT_AI_PROVIDER,
} from '../constants/lead-enrichment-ai.constants';

@Injectable()
export class AiConfig {
    constructor(private readonly configService: ConfigService) { }

    private readonly supportedModels: AIModelInfo[] = [
        { provider: AiProviders.openai, model: AiModels.openai.gpt4o },
        { provider: AiProviders.openai, model: AiModels.openai.gpt4oMini },
        { provider: AiProviders.openai, model: AiModels.openai.gpt4Turbo },
        { provider: AiProviders.openai, model: AiModels.openai.gpt4 },
        { provider: AiProviders.openai, model: AiModels.openai.gpt35Turbo },
        { provider: AiProviders.grok, model: AiModels.grok.grokBeta },
        { provider: AiProviders.grok, model: AiModels.grok.grokPro },
        { provider: AiProviders.gemini, model: AiModels.gemini.geminiPro },
        { provider: AiProviders.gemini, model: AiModels.gemini.geminiProVision },
        { provider: AiProviders.gemini, model: AiModels.gemini.gemini15Pro },
        { provider: AiProviders.perplexity, model: AiModels.perplexity.sonar },
        { provider: AiProviders.perplexity, model: AiModels.perplexity.sonarPro },
        { provider: AiProviders.claude, model: AiModels.claude.sonnet },
        { provider: AiProviders.claude, model: AiModels.claude.haiku },
    ];

    resolveLeadEnrichmentAiProvider(): AiProvider {
        const raw = LEAD_ENRICHMENT_AI_PROVIDER;
        if (isLeadEnrichmentAiProvider(raw)) {
            return raw;
        }
        return DEFAULT_LEAD_ENRICHMENT_AI_PROVIDER;
    }

    isOpenAiConfigured(): boolean {
        return Boolean(this.configService.get<string>('OPENAI_API_KEY')?.trim());
    }

    isPerplexityConfigured(): boolean {
        return Boolean(this.configService.get<string>('PERPLEXITY_API_KEY')?.trim());
    }

    isAnthropicConfigured(): boolean {
        return Boolean(this.configService.get<string>('ANTHROPIC_API_KEY')?.trim());
    }

    isLeadEnrichmentAiConfigured(provider: AiProvider): boolean {
        if (provider === AiProviders.openai) {
            return this.isOpenAiConfigured();
        }
        if (provider === AiProviders.perplexity) {
            return this.isPerplexityConfigured();
        }
        if (provider === AiProviders.claude) {
            return this.isAnthropicConfigured();
        }
        return false;
    }

    getModelAdapter(provider: AiProvider = AiProviders.openai, model: string = AiModels.openai.gpt4o) {
        switch (provider) {
            case AiProviders.openai:
                return openai(model);
            case AiProviders.perplexity: {
                const apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
                if (!apiKey?.trim()) {
                    throw new Error('PERPLEXITY_API_KEY is not configured');
                }
                const perplexity = createOpenAI({
                    apiKey,
                    baseURL: 'https://api.perplexity.ai',
                    compatibility: 'compatible',
                });
                return perplexity(model);
            }
            case AiProviders.claude: {
                const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
                if (!apiKey?.trim()) {
                    throw new Error('ANTHROPIC_API_KEY is not configured');
                }
                const anthropic = createAnthropic({ apiKey });
                return anthropic(model);
            }
            case AiProviders.grok:
                throw new Error('Grok provider not yet implemented. SDK required.');
            case AiProviders.gemini:
                throw new Error('Gemini provider not yet implemented. SDK required.');
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }


    isModelSupported(provider: AiProvider, model: string): boolean {
        return this.supportedModels.some(
            supportedModel => supportedModel.provider === provider && supportedModel.model === model
        );
    }

    getSupportedModels(): AIModelInfo[] {
        return [...this.supportedModels];
    }

    getModelsByProvider(provider: AiProvider): AIModelInfo[] {
        return this.supportedModels.filter(model => model.provider === provider);
    }

    validateProviderAndModel(provider: AiProvider, model: string): void {
        if (!this.isModelSupported(provider, model)) {
            const availableModels = this.getModelsByProvider(provider)
                .map(m => m.model)
                .join(', ');

            throw new Error(
                `Model ${model} is not supported for provider ${provider}. ` +
                `Available models for ${provider}: ${availableModels || 'none'}`
            );
        }
    }
}
