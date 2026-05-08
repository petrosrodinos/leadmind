import { SourceType } from "../interfaces/lead.interface";

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
