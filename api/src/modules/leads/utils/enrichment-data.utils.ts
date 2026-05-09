export function summarizeLinkedInPlain(plain: Record<string, unknown> | null): string {
    if (!plain) {
        return '';
    }
    const headline = typeof plain.headline === 'string' ? plain.headline.trim() : '';
    const name =
        typeof plain.fullName === 'string'
            ? plain.fullName.trim()
            : typeof plain.name === 'string'
              ? plain.name.trim()
              : '';
    const company = typeof plain.companyName === 'string' ? plain.companyName.trim() : '';
    const parts = [name, headline, company].filter(Boolean).slice(0, 3);
    return parts.join(' — ');
}

export function normalizeWebsiteUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return t;
    return t.startsWith('http') ? t : `https://${t}`;
}

export function isLinkedInCompanyUrl(url: string): boolean {
    return /linkedin\.com\/company\//i.test(url);
}

export function isLinkedInProfileUrl(url: string): boolean {
    return /linkedin\.com\/in\//i.test(url);
}

export function toPlainRecord(v: unknown): Record<string, unknown> | null {
    if (v == null) return null;
    try {
        return JSON.parse(JSON.stringify(v)) as Record<string, unknown>;
    } catch {
        return null;
    }
}
