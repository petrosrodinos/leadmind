import { SenderProfile } from '@/generated/prisma';
import type { PlaceholderVars } from '@/shared/utils/placeholder-render.util';
import {
    appendUtmParams,
    mergeOutboundUtmParams,
    parseUtmParams,
} from '@/shared/utils/utm-params.util';

export type SenderProfilePlaceholderOptions = {
    campaignUuid?: string | null;
};

export const SENDER_PROFILE_PLACEHOLDER_KEYS = [
    'first_name',
    'last_name',
    'full_name',
    'title',
    'company_name',
    'email',
    'phone',
    'website',
    'website_display',
    'address',
    'city',
    'country',
    'booking_url',
    'signature',
    'sender_id',
] as const;

function ensureProtocol(url: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

function stripProtocol(url: string): string {
    if (!url) return '';
    return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function senderProfileToPlaceholders(
    profile: SenderProfile | null | undefined,
    options?: SenderProfilePlaceholderOptions,
): PlaceholderVars {
    if (!profile) {
        return Object.fromEntries(SENDER_PROFILE_PLACEHOLDER_KEYS.map((k) => [k, '']));
    }

    const first = profile.first_name ?? '';
    const last = profile.last_name ?? '';
    const full = [first, last].filter(Boolean).join(' ').trim();
    const rawWebsite = profile.website ?? '';
    const rawBookingUrl = profile.booking_url ?? '';
    const websiteUtm = mergeOutboundUtmParams(
        parseUtmParams(profile.website_utm),
        options?.campaignUuid,
    );
    const bookingUtm = mergeOutboundUtmParams(
        parseUtmParams(profile.booking_utm),
        options?.campaignUuid,
    );
    const websiteWithUtm = appendUtmParams(ensureProtocol(rawWebsite), websiteUtm);
    const bookingWithUtm = appendUtmParams(ensureProtocol(rawBookingUrl), bookingUtm);

    return {
        first_name: first,
        last_name: last,
        full_name: full,
        title: profile.title ?? '',
        company_name: profile.company_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        website: websiteWithUtm,
        website_display: stripProtocol(websiteWithUtm || rawWebsite),
        address: profile.address ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        booking_url: bookingWithUtm,
        signature: profile.signature ?? '',
        sender_id: profile.sender_id ?? '',
    };
}
