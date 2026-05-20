export type UtmParams = {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
};

const UTM_FIELD_MAP: Record<keyof UtmParams, string> = {
    source: 'utm_source',
    medium: 'utm_medium',
    campaign: 'utm_campaign',
    term: 'utm_term',
    content: 'utm_content',
};

export function parseUtmParams(value: unknown): UtmParams | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    const record = value as Record<string, unknown>;
    const parsed: UtmParams = {};
    for (const key of Object.keys(UTM_FIELD_MAP) as (keyof UtmParams)[]) {
        const raw = record[key];
        if (typeof raw === 'string' && raw.trim()) {
            parsed[key] = raw.trim();
        }
    }
    return Object.keys(parsed).length > 0 ? parsed : null;
}

export function normalizeUtmParamsInput(
    input?: UtmParams | null,
): UtmParams | null | undefined {
    if (input === undefined) {
        return undefined;
    }
    if (input === null) {
        return null;
    }
    return parseUtmParams(input);
}

export function appendUtmParams(baseUrl: string, utm: UtmParams | null | undefined): string {
    if (!baseUrl?.trim()) {
        return '';
    }
    if (!utm) {
        return baseUrl.trim();
    }

    try {
        const url = new URL(baseUrl);
        for (const key of Object.keys(UTM_FIELD_MAP) as (keyof UtmParams)[]) {
            const value = utm[key]?.trim();
            if (value) {
                url.searchParams.set(UTM_FIELD_MAP[key], value);
            }
        }
        return url.toString();
    } catch {
        return baseUrl.trim();
    }
}
