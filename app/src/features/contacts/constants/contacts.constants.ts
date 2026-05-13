import { LeadStatus } from "../interfaces/contact.interface";

export const STATUS_OPTIONS: Array<{ id: LeadStatus; label: string }> = [
    { id: LeadStatus.NEW, label: "New" },
    { id: LeadStatus.CONTACTED, label: "Contacted" },
    { id: LeadStatus.CONVERTED, label: "Converted" },
    { id: LeadStatus.ARCHIVED, label: "Archived" },
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: "New",
    [LeadStatus.CONTACTED]: "Contacted",
    [LeadStatus.CONVERTED]: "Converted",
    [LeadStatus.ARCHIVED]: "Archived",
};