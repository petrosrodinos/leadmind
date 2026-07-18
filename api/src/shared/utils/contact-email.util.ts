const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeContactEmail(
    email: string | null | undefined,
): string | null {
    if (email == null) return null;
    const trimmed = email.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function hasUsableContactEmail(
    email: string | null | undefined,
): boolean {
    const normalized = normalizeContactEmail(email);
    if (!normalized) return false;
    return BASIC_EMAIL_REGEX.test(normalized);
}
