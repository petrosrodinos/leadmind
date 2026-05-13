import { tryDescribeCronExpression } from "@/lib/cron";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import {
    REVENUES,
    REVENUE_LABELS,
} from "@/features/filters/constants/generic-lead-finder";
import {
    LINKEDIN_APIFY_CONTACT_SENIORITY,
    LINKEDIN_APIFY_CONTACT_SENIORITY_LABELS,
} from "@/features/filters/constants/linkedin-apify-enums.generated";

export const LINKEDIN_SENIORITY_OPTIONS = LINKEDIN_APIFY_CONTACT_SENIORITY.map((v) => ({
    value: v,
    label: LINKEDIN_APIFY_CONTACT_SENIORITY_LABELS[v] ?? v,
}));

export const REVENUE_OPTIONS = REVENUES.map((v) => ({
    value: v,
    label: REVENUE_LABELS[v],
}));

export const SOURCE_OPTIONS: Array<{ id: SourceType; label: string }> = [
    { id: SourceType.LINKEDIN, label: "LinkedIn" },
    { id: SourceType.GOOGLE_MAPS, label: "Google Maps" },
    { id: SourceType.GENERIC_LEAD, label: "Generic Lead Finder" },
    { id: SourceType.MANUAL, label: "Manual" },
];

export const CHANNEL_OPTIONS: Array<{ id: Channel; label: string }> = [
    { id: Channel.EMAIL, label: "Email" },
    { id: Channel.SMS, label: "SMS" },
];

export const CRON_NONE = "__none__";

export const CRON_PRESETS: Array<{ id: string; label: string; expr: string }> = [
    { id: "hourly", label: "Every hour", expr: "0 * * * *" },
    { id: "every-6h", label: "Every 6 hours", expr: "0 */6 * * *" },
    { id: "daily-9am", label: "Every day at 9:00 AM", expr: "0 9 * * *" },
    { id: "daily-midnight", label: "Every day at midnight", expr: "0 0 * * *" },
    { id: "weekdays-9am", label: "Weekdays at 9:00 AM", expr: "0 9 * * 1-5" },
    { id: "monday-9am", label: "Every Monday at 9:00 AM", expr: "0 9 * * 1" },
    { id: "sunday-midnight", label: "Every Sunday at midnight", expr: "0 0 * * 0" },
];

const CRON_VALUE_TO_ID = new Map<string, string>(
    CRON_PRESETS.map((p) => [p.expr, p.id]),
);

export const cronToSelectId = (expr: string | null | undefined): string => {
    if (!expr) return CRON_NONE;
    return CRON_VALUE_TO_ID.get(expr) ?? CRON_NONE;
};

export const selectIdToCron = (id: string): string => {
    if (id === CRON_NONE) return "";
    return CRON_PRESETS.find((p) => p.id === id)?.expr ?? "";
};

export const cronPreview = (expr: string | undefined): string | null => {
    if (!expr) return null;
    return tryDescribeCronExpression(expr) ?? "Invalid cron expression";
};
