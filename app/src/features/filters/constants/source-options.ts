import { SourceType } from "@/features/leads/interfaces/lead.interface";

export const SOURCE_OPTIONS: Array<{ id: SourceType; label: string }> = [
    { id: SourceType.LINKEDIN, label: "LinkedIn" },
    { id: SourceType.GOOGLE_MAPS, label: "Google Maps" },
    { id: SourceType.GENERIC_LEAD, label: "Generic Lead Finder" },
    { id: SourceType.GEMI, label: "GEMI (GR)" },
];
