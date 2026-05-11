import { SenderProfile } from '@/generated/prisma';
import type { PlaceholderVars } from '@/shared/utils/placeholder-render.util';

export const SENDER_PROFILE_PLACEHOLDER_KEYS = [
    'first_name',
    'last_name',
    'full_name',
    'title',
    'company_name',
    'email',
    'phone',
    'website',
    'address',
    'city',
    'country',
    'booking_url',
    'signature',
    'sender_id',
] as const;

export function senderProfileToPlaceholders(profile: SenderProfile | null | undefined): PlaceholderVars {
    if (!profile) {
        return Object.fromEntries(SENDER_PROFILE_PLACEHOLDER_KEYS.map((k) => [k, '']));
    }

    const first = profile.first_name ?? '';
    const last = profile.last_name ?? '';
    const full = [first, last].filter(Boolean).join(' ').trim();

    return {
        first_name: first,
        last_name: last,
        full_name: full,
        title: profile.title ?? '',
        company_name: profile.company_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        website: profile.website ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        booking_url: profile.booking_url ?? '',
        signature: profile.signature ?? '',
        sender_id: profile.sender_id ?? '',
    };
}
