import type { CrawledPage } from '@/integrations/apify/website-content-crawler/website-content-crawler.interfaces';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK_EMAIL_DOMAIN_FRAGMENTS = [
    'example.com',
    'sentry.io',
    'wixpress.com',
    'users.noreply.github.com',
    'email.com',
    'domain.com',
    'yourdomain.com',
];

const GENERIC_LOCAL_PARTS = new Set([
    'info',
    'contact',
    'hello',
    'support',
    'sales',
    'admin',
    'office',
    'mail',
    'enquiries',
    'inquiry',
]);

function isJunkEmail(email: string): boolean {
    const lower = email.toLowerCase();
    if (lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.gif')) {
        return true;
    }
    return JUNK_EMAIL_DOMAIN_FRAGMENTS.some((fragment) => lower.endsWith(`@${fragment}`) || lower.includes(`@${fragment}`));
}

function extractEmailsFromHaystack(haystack: string): string[] {
    const matches = haystack.match(EMAIL_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) {
        const normalized = match.toLowerCase();
        if (!isJunkEmail(normalized)) {
            unique.add(normalized);
        }
    }
    return [...unique];
}

export function extractEmailsFromCrawledPage(page: CrawledPage | null): string[] {
    if (!page) return [];
    const parts = [page.title, page.markdown, page.text, plainTextFromCrawledPage(page)].filter(Boolean);
    const haystack = parts.join('\n');
    return extractEmailsFromHaystack(haystack);
}

export function pickBestContactEmail(emails: string[]): string | null {
    if (emails.length === 0) return null;
    if (emails.length === 1) return emails[0]!;

    const personal = emails.filter((email) => {
        const local = email.split('@')[0] ?? '';
        return local.length > 0 && !GENERIC_LOCAL_PARTS.has(local);
    });
    if (personal.length > 0) return personal[0]!;

    const generic = emails.filter((email) => {
        const local = email.split('@')[0] ?? '';
        return GENERIC_LOCAL_PARTS.has(local);
    });
    if (generic.length > 0) return generic[0]!;

    return emails[0]!;
}
