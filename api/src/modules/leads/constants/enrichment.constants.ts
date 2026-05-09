import { EnrichmentSource } from '@/generated/prisma';

export const DEFAULT_ENRICHMENT_SOURCES: EnrichmentSource[] = [
    EnrichmentSource.LINKEDIN,
    EnrichmentSource.WEBSITE,
    EnrichmentSource.GOOGLE_SEARCH,
    EnrichmentSource.AI,
];

export const SOURCE_ORDER: EnrichmentSource[] = DEFAULT_ENRICHMENT_SOURCES;

