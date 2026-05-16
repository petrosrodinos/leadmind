import { EnrichmentSource } from '@/generated/prisma';

export const DEFAULT_ENRICHMENT_SOURCES: EnrichmentSource[] = [
    EnrichmentSource.GEMI,
    EnrichmentSource.LINKEDIN,
    EnrichmentSource.WEBSITE,
    EnrichmentSource.GOOGLE_SEARCH,
    EnrichmentSource.AI,
];
