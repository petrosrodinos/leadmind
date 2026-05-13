import { EnrichmentSource } from '@/generated/prisma';
import {
    normalizeEnrichmentSources,
    resolveContactEnrichmentSources,
    resolveLeadEnrichmentSources,
} from './enrichment-sources.utils';

describe('enrichment source utilities', () => {
    it('normalizes source order and removes duplicates', () => {
        expect(
            normalizeEnrichmentSources([
                EnrichmentSource.AI,
                EnrichmentSource.LINKEDIN,
                EnrichmentSource.AI,
            ]),
        ).toEqual([EnrichmentSource.LINKEDIN, EnrichmentSource.AI]);
    });

    it('uses default lead sources only when manual sources are missing', () => {
        expect(resolveLeadEnrichmentSources(undefined)).toEqual([
            EnrichmentSource.LINKEDIN,
            EnrichmentSource.WEBSITE,
            EnrichmentSource.GOOGLE_SEARCH,
            EnrichmentSource.AI,
        ]);
        expect(resolveLeadEnrichmentSources([])).toEqual([]);
    });

    it('prefers explicit contact sources over filter sources', () => {
        expect(
            resolveContactEnrichmentSources([EnrichmentSource.AI], {
                enrichment_sources: [EnrichmentSource.LINKEDIN],
            }),
        ).toEqual([EnrichmentSource.AI]);
    });

    it('uses filter sources for contacts when manual sources are missing', () => {
        expect(
            resolveContactEnrichmentSources(undefined, {
                enrichment_sources: [EnrichmentSource.GOOGLE_SEARCH, EnrichmentSource.LINKEDIN],
            }),
        ).toEqual([EnrichmentSource.LINKEDIN, EnrichmentSource.GOOGLE_SEARCH]);
    });
});
