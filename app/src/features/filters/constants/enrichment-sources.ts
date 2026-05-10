export const EnrichmentSource = {
    LINKEDIN: "LINKEDIN",
    WEBSITE: "WEBSITE",
    GOOGLE_SEARCH: "GOOGLE_SEARCH",
    AI: "AI",
} as const;

export type EnrichmentSource = (typeof EnrichmentSource)[keyof typeof EnrichmentSource];

export const DEFAULT_ENRICHMENT_SOURCES: EnrichmentSource[] = [
    EnrichmentSource.LINKEDIN,
    EnrichmentSource.WEBSITE,
    EnrichmentSource.GOOGLE_SEARCH,
    EnrichmentSource.AI,
];

export const ENRICHMENT_SOURCE_OPTIONS: Array<{ id: EnrichmentSource; label: string }> = [
    { id: EnrichmentSource.LINKEDIN, label: "LinkedIn" },
    { id: EnrichmentSource.WEBSITE, label: "Website crawl" },
    { id: EnrichmentSource.GOOGLE_SEARCH, label: "Google Search" },
    { id: EnrichmentSource.AI, label: "AI search" },
];
