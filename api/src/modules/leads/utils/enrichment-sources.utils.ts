import { EnrichmentSource } from '@/generated/prisma';
import { DEFAULT_ENRICHMENT_SOURCES } from '../constants/enrichment.constants';

export function normalizeEnrichmentSources(
    sources: EnrichmentSource[] | null | undefined,
    fallback: EnrichmentSource[] = [],
): EnrichmentSource[] {
    const input = sources === undefined || sources === null ? fallback : sources;
    const wanted = new Set(input);
    return DEFAULT_ENRICHMENT_SOURCES.filter((source) => wanted.has(source));
}

export function resolveLeadEnrichmentSources(sources: EnrichmentSource[] | null | undefined): EnrichmentSource[] {
    return normalizeEnrichmentSources(sources, DEFAULT_ENRICHMENT_SOURCES);
}

export function resolveContactEnrichmentSources(
    sources: EnrichmentSource[] | null | undefined,
    filter: { enrichment_sources: EnrichmentSource[] } | null | undefined,
): EnrichmentSource[] {
    if (sources !== undefined) {
        return normalizeEnrichmentSources(sources);
    }
    return normalizeEnrichmentSources(filter?.enrichment_sources);
}
