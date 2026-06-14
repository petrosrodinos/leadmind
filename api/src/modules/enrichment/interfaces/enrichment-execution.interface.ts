import { EnrichmentSource, Prisma } from '@/generated/prisma';
import { EnrichmentProfileUpdate } from '../utils/enrichment-subject.utils';

export type EnrichmentAttemptStatus = 'success' | 'failed';

export interface EnrichmentSourceResult {
    source: EnrichmentSource;
    source_url: string | null;
    summary: string;
    payload: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue | null;
    entity_update?: EnrichmentProfileUpdate;
    cost_usd?: number | null;
    input_tokens?: number | null;
    output_tokens?: number | null;
}

export interface EnrichmentAttemptInput extends EnrichmentSourceResult {
    status: EnrichmentAttemptStatus;
}
