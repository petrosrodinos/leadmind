import { EnrichmentSource, Prisma } from '@/generated/prisma';

export type LeadEnrichmentAttemptStatus = 'success' | 'failed';

export interface LeadEnrichmentSourceResult {
    source: EnrichmentSource;
    source_url: string | null;
    summary: string;
    payload: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue | null;
    lead_update?: Prisma.LeadUpdateInput;
    cost_usd?: number | null;
    input_tokens?: number | null;
    output_tokens?: number | null;
}

export interface LeadEnrichmentAttemptInput extends LeadEnrichmentSourceResult {
    status: LeadEnrichmentAttemptStatus;
}
