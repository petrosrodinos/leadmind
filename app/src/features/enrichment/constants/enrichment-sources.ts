import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Globe, Search, Sparkles } from "lucide-react";
import { SourceType } from "@/features/leads/interfaces/lead.interface";

export const EnrichmentSource = {
    LINKEDIN: "LINKEDIN",
    WEBSITE: "WEBSITE",
    GOOGLE_SEARCH: "GOOGLE_SEARCH",
    AI: "AI",
    GEMI: "GEMI",
} as const;

export type EnrichmentSource = (typeof EnrichmentSource)[keyof typeof EnrichmentSource];

type EnrichmentChipColor = "default" | "accent" | "success" | "warning" | "danger";

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

export const GEMI_REGISTRY_ENRICHMENT_OPTION = {
    id: EnrichmentSource.GEMI,
    label: "GEMI registry",
} as const;

export function enrichmentSourceOptionsForLead(sourceType: SourceType | undefined) {
    if (sourceType === SourceType.GEMI) {
        return [GEMI_REGISTRY_ENRICHMENT_OPTION, ...ENRICHMENT_SOURCE_OPTIONS];
    }
    return ENRICHMENT_SOURCE_OPTIONS;
}

export function defaultEnrichmentSourcesForLead(sourceType: SourceType | undefined): EnrichmentSource[] {
    if (sourceType === SourceType.GEMI) {
        return [EnrichmentSource.GEMI, ...DEFAULT_ENRICHMENT_SOURCES];
    }
    return DEFAULT_ENRICHMENT_SOURCES;
}

export function enrichmentSourceOptionsForBulk() {
    return [GEMI_REGISTRY_ENRICHMENT_OPTION, ...ENRICHMENT_SOURCE_OPTIONS];
}

export const ENRICHMENT_SOURCE_ICON: Record<EnrichmentSource, LucideIcon> = {
    [EnrichmentSource.LINKEDIN]: Briefcase,
    [EnrichmentSource.WEBSITE]: Globe,
    [EnrichmentSource.GOOGLE_SEARCH]: Search,
    [EnrichmentSource.AI]: Sparkles,
    [EnrichmentSource.GEMI]: Building2,
};

export const ENRICHMENT_SOURCE_CHIP_COLOR: Record<EnrichmentSource, EnrichmentChipColor> = {
    [EnrichmentSource.LINKEDIN]: "accent",
    [EnrichmentSource.WEBSITE]: "success",
    [EnrichmentSource.GOOGLE_SEARCH]: "warning",
    [EnrichmentSource.AI]: "default",
    [EnrichmentSource.GEMI]: "warning",
};

export const ENRICHMENT_SOURCE_LABEL: Record<EnrichmentSource, string> = [
    ...ENRICHMENT_SOURCE_OPTIONS,
    GEMI_REGISTRY_ENRICHMENT_OPTION,
].reduce(
    (acc, opt) => ({ ...acc, [opt.id]: opt.label }),
    {} as Record<EnrichmentSource, string>,
);
