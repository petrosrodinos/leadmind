export function normalizeExternalUrl(raw: string): string | null {
    const t = raw.trim();
    if (!t) return null;
    try {
        const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
        const u = new URL(withScheme);
        if (u.protocol !== "http:" && u.protocol !== "https:") return null;
        return u.href;
    } catch {
        return null;
    }
}
