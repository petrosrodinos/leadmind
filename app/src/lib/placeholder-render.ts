import type { SenderProfile } from "@/features/sender-profiles/interfaces/sender-profile.interface";

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export type PlaceholderVars = Record<string, string>;

export interface PlaceholderOption {
    key: string;
    label: string;
    description: string;
}

export const PLACEHOLDER_OPTIONS: readonly PlaceholderOption[] = [
    { key: "first_name", label: "First name", description: "Your first name" },
    { key: "last_name", label: "Last name", description: "Your last name" },
    { key: "full_name", label: "Full name", description: "First + last name" },
    { key: "title", label: "Job title", description: "Your role" },
    { key: "company_name", label: "Company", description: "Your company name" },
    { key: "email", label: "Email", description: "Your email address" },
    { key: "phone", label: "Phone", description: "Your phone number" },
    { key: "website", label: "Website URL", description: "With https:// prefix" },
    { key: "website_display", label: "Website (clean)", description: "Without protocol" },
    { key: "address", label: "Address", description: "Street address" },
    { key: "city", label: "City", description: "City" },
    { key: "country", label: "Country", description: "Country" },
    { key: "booking_url", label: "Booking URL", description: "Calendar booking link" },
    { key: "signature", label: "Signature", description: "Email signature block" },
    { key: "sender_id", label: "Sender ID", description: "SMS sender ID" },
] as const;

export function renderPlaceholders(template: string, vars: PlaceholderVars): string {
    if (!template) return template;
    return template.replace(PLACEHOLDER_PATTERN, (_, key: string) => vars[key] ?? "");
}

function ensureProtocol(url: string): string {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

function stripProtocol(url: string): string {
    if (!url) return "";
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function senderProfileToPlaceholders(
    profile: SenderProfile | null | undefined,
): PlaceholderVars {
    if (!profile) {
        return {
            first_name: "",
            last_name: "",
            full_name: "",
            title: "",
            company_name: "",
            email: "",
            phone: "",
            website: "",
            website_display: "",
            address: "",
            city: "",
            country: "",
            booking_url: "",
            signature: "",
            sender_id: "",
        };
    }

    const first = profile.first_name ?? "";
    const last = profile.last_name ?? "";
    const full = [first, last].filter(Boolean).join(" ").trim();
    const rawWebsite = profile.website ?? "";
    const rawBookingUrl = profile.booking_url ?? "";

    return {
        first_name: first,
        last_name: last,
        full_name: full,
        title: profile.title ?? "",
        company_name: profile.company_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        website: ensureProtocol(rawWebsite),
        website_display: stripProtocol(rawWebsite),
        address: profile.address ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        booking_url: ensureProtocol(rawBookingUrl),
        signature: profile.signature ?? "",
        sender_id: profile.sender_id ?? "",
    };
}

export function defaultSenderProfile(
    profiles: SenderProfile[] | undefined,
): SenderProfile | null {
    if (!profiles || profiles.length === 0) return null;
    return profiles.find((p) => p.is_default) ?? profiles[0];
}
