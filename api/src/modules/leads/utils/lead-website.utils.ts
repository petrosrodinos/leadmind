import { normalizeWebsiteUrl } from './enrichment-data.utils';

const FREE_EMAIL_DOMAINS = new Set([
    'aol.com',
    'gmail.com',
    'googlemail.com',
    'hotmail.com',
    'icloud.com',
    'live.com',
    'mac.com',
    'mail.com',
    'me.com',
    'msn.com',
    'outlook.com',
    'proton.me',
    'protonmail.com',
    'yahoo.com',
    'ymail.com',
]);

export function websiteFromBusinessEmail(email: string | undefined | null): string | undefined {
    if (!email?.trim()) return undefined;

    const trimmed = email.trim();
    const at = trimmed.lastIndexOf('@');
    if (at <= 0 || at >= trimmed.length - 1) return undefined;

    const domain = trimmed.slice(at + 1).toLowerCase().replace(/\.$/, '');
    if (!domain || domain.includes(' ') || !domain.includes('.')) return undefined;
    if (FREE_EMAIL_DOMAINS.has(domain)) return undefined;

    return normalizeWebsiteUrl(domain);
}

export function resolveLeadWebsite(
    website: string | undefined | null,
    email: string | undefined | null,
): string | null {
    const fromWebsite = website?.trim();
    if (fromWebsite) return fromWebsite;
    return websiteFromBusinessEmail(email) ?? null;
}
