import { AiModels, AiProviders, type AiProvider } from '../interfaces/ai.interface';

export const LEAD_ENRICHMENT_AI_PROVIDER_ENV_KEY = 'LEAD_ENRICHMENT_AI_PROVIDER';

export type LeadEnrichmentAiProvider = typeof AiProviders.perplexity | typeof AiProviders.claude;

export const DEFAULT_LEAD_ENRICHMENT_AI_PROVIDER: LeadEnrichmentAiProvider = AiProviders.claude;

export const LEAD_ENRICHMENT_AI_MODEL: Record<LeadEnrichmentAiProvider, string> = {
    [AiProviders.perplexity]: AiModels.perplexity.sonarPro,
    [AiProviders.claude]: AiModels.claude.sonnet35,
};

export function isLeadEnrichmentAiProvider(value: string | undefined): value is LeadEnrichmentAiProvider {
    return value === AiProviders.perplexity || value === AiProviders.claude;
}

export function leadEnrichmentModelForProvider(provider: AiProvider): string {
    if (isLeadEnrichmentAiProvider(provider)) {
        return LEAD_ENRICHMENT_AI_MODEL[provider];
    }
    return LEAD_ENRICHMENT_AI_MODEL[DEFAULT_LEAD_ENRICHMENT_AI_PROVIDER];
}
