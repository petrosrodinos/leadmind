import type { LucideIcon } from "lucide-react";
import { Briefcase, Globe, Search, Sparkles } from "lucide-react";

export const EnrichmentSource = {
    LINKEDIN: "LINKEDIN",
    WEBSITE: "WEBSITE",
    GOOGLE_SEARCH: "GOOGLE_SEARCH",
    AI: "AI",
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

export const ENRICHMENT_SOURCE_ICON: Record<EnrichmentSource, LucideIcon> = {
    [EnrichmentSource.LINKEDIN]: Briefcase,
    [EnrichmentSource.WEBSITE]: Globe,
    [EnrichmentSource.GOOGLE_SEARCH]: Search,
    [EnrichmentSource.AI]: Sparkles,
};

export const ENRICHMENT_SOURCE_CHIP_COLOR: Record<EnrichmentSource, EnrichmentChipColor> = {
    [EnrichmentSource.LINKEDIN]: "accent",
    [EnrichmentSource.WEBSITE]: "success",
    [EnrichmentSource.GOOGLE_SEARCH]: "warning",
    [EnrichmentSource.AI]: "default",
};

export const ENRICHMENT_SOURCE_LABEL: Record<EnrichmentSource, string> = ENRICHMENT_SOURCE_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.id]: opt.label }),
    {} as Record<EnrichmentSource, string>,
);
