import type { AiUsageOperation } from "@/features/ai-usage/interfaces/ai-usage.interface";

export const AI_USAGE_OPERATION_LABELS: Record<AiUsageOperation, string> = {
    LEAD_ENRICH: "Lead enrich",
    CONTACT_SCORE: "Contact score",
    CONTACT_DRAFT: "Contact draft",
    CAMPAIGN_DRAFT: "Campaign draft",
    ENRICHMENT_SUMMARY: "Enrichment summary",
    AUDIENCE_ANALYSIS: "Audience analysis",
    EMBEDDING: "Embedding",
    ADMIN_GENERATE: "Admin generate",
    BATCH_JOB: "Batch job",
    OTHER: "Other",
};

export const AI_USAGE_PROVIDER_OPTIONS = [
    { key: "openai", label: "OpenAI" },
    { key: "anthropic", label: "Anthropic" },
    { key: "perplexity", label: "Perplexity" },
];
