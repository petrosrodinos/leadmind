import type { SenderProfile } from "@/features/sender-profiles/interfaces/sender-profile.interface";

const PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export type PlaceholderVars = Record<string, string>;

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
