import {
    Briefcase,
    Building2,
    Globe,
    Hand,
    MapPin,
    Search,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { SourceType } from "../interfaces/lead.interface";

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

export const SOURCE_ICON: Record<SourceType, LucideIcon> = {
    [SourceType.LINKEDIN]: Briefcase,
    [SourceType.GOOGLE_MAPS]: MapPin,
    [SourceType.GOOGLE_SEARCH]: Search,
    [SourceType.GENERIC_LEAD]: Sparkles,
    [SourceType.WEBSITE_CRAWLER]: Globe,
    [SourceType.GEMI]: Building2,
    [SourceType.MANUAL]: Hand,
};

export const SOURCE_CHIP_COLOR: Record<SourceType, ChipColor> = {
    [SourceType.LINKEDIN]: "accent",
    [SourceType.GOOGLE_MAPS]: "danger",
    [SourceType.GOOGLE_SEARCH]: "warning",
    [SourceType.GENERIC_LEAD]: "success",
    [SourceType.WEBSITE_CRAWLER]: "default",
    [SourceType.GEMI]: "warning",
    [SourceType.MANUAL]: "default",
};

export const SOURCE_OPTIONS: Array<{ id: SourceType; label: string }> = [
    { id: SourceType.LINKEDIN, label: "LinkedIn" },
    { id: SourceType.GOOGLE_MAPS, label: "Google Maps" },
    { id: SourceType.GOOGLE_SEARCH, label: "Google Search" },
    { id: SourceType.WEBSITE_CRAWLER, label: "Website Crawler" },
    { id: SourceType.GENERIC_LEAD, label: "Generic Lead" },
    { id: SourceType.GEMI, label: "GEMI (GR)" },
    { id: SourceType.MANUAL, label: "Manual" },
];

export const SOURCE_LABEL: Record<SourceType, string> = SOURCE_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.id]: opt.label }),
    {} as Record<SourceType, string>,
);
