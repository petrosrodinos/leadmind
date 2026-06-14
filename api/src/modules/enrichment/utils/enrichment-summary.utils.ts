import { EnrichmentSource, Prisma } from '@/generated/prisma';
import { DEFAULT_ENRICHMENT_SOURCES } from '@/modules/leads/constants/enrichment.constants';

const MAX_ENRICHMENT_SUMMARY_LENGTH = 32000;
const MAX_SOURCE_CONTEXT_PAYLOAD_LENGTH = 4000;

export type EnrichmentHistoryRow = {
    source: EnrichmentSource;
    summary: string | null;
    source_url: string | null;
    payload: Prisma.JsonValue | null;
    metadata: Prisma.JsonValue | null;
    created_at: Date;
};

export function fallbackBlockText(
    source: EnrichmentSource,
    payload: Prisma.JsonValue | null,
): string {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return '(enriched)';
    }
    const o = payload as Record<string, unknown>;
    if (source === EnrichmentSource.WEBSITE) {
        const t = o.text_sample;
        if (typeof t === 'string' && t.trim()) {
            const trimmed = t.trim();
            const s = trimmed.slice(0, 400);
            return s.length < trimmed.length ? `${s}…` : s;
        }
        const title = o.title;
        if (typeof title === 'string' && title.trim()) {
            return title.trim();
        }
    }
    if (source === EnrichmentSource.GOOGLE_SEARCH) {
        const r = o.results;
        if (Array.isArray(r) && r.length > 0) {
            const titles = r
                .map((x) =>
                    x &&
                    typeof x === 'object' &&
                    'title' in x &&
                    typeof (x as { title?: unknown }).title === 'string'
                        ? (x as { title: string }).title
                        : null,
                )
                .filter((x): x is string => Boolean(x))
                .slice(0, 5);
            if (titles.length) {
                return titles.join('; ');
            }
        }
    }
    if (source === EnrichmentSource.LINKEDIN) {
        const data = o.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const d = data as Record<string, unknown>;
            const parts = [d.headline, d.company, d.companyName, d.fullName, d.name]
                .map((x) => (typeof x === 'string' ? x.trim() : ''))
                .filter(Boolean)
                .slice(0, 2);
            if (parts.length) {
                return parts.join(' — ');
            }
        }
    }
    if (source === EnrichmentSource.GEMI) {
        const company = o.company;
        if (company && typeof company === 'object' && !Array.isArray(company)) {
            const c = company as Record<string, unknown>;
            const parts = [c.coNameEl, c.status && typeof c.status === 'object' && 'descr' in c.status ? (c.status as { descr?: string }).descr : null, c.city]
                .map((x) => (typeof x === 'string' ? x.trim() : ''))
                .filter(Boolean);
            if (parts.length) {
                return parts.join(' · ');
            }
        }
    }
    return '(enriched)';
}

export function latestEnrichmentBySource(
    rows: EnrichmentHistoryRow[],
): Map<EnrichmentSource, EnrichmentHistoryRow> {
    const latestBySource = new Map<EnrichmentSource, EnrichmentHistoryRow>();
    for (const row of rows) {
        if (!latestBySource.has(row.source)) {
            latestBySource.set(row.source, row);
        }
    }
    return latestBySource;
}

export function buildDeterministicEnrichmentSummary(rows: EnrichmentHistoryRow[]): string | null {
    const latestBySource = latestEnrichmentBySource(rows);
    const parts: string[] = [];
    for (const src of DEFAULT_ENRICHMENT_SOURCES) {
        const row = latestBySource.get(src);
        if (!row) {
            continue;
        }
        const trimmed = row.summary?.trim();
        const text = trimmed || fallbackBlockText(src, row.payload);
        parts.push(text);
    }
    let body = parts.join('\n\n');
    if (body.length > MAX_ENRICHMENT_SUMMARY_LENGTH) {
        body = `${body.slice(0, MAX_ENRICHMENT_SUMMARY_LENGTH - 3)}...`;
    }
    return body || null;
}

export function coerceEnrichmentMetadata(raw: unknown): Prisma.InputJsonValue | null {
    if (raw == null) {
        return null;
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const o = raw as Record<string, unknown>;
    if (Object.keys(o).length === 0) {
        return null;
    }
    return o as Prisma.InputJsonValue;
}

export function formatEnrichmentRowsForSummary(rows: EnrichmentHistoryRow[]): string {
    const latestBySource = latestEnrichmentBySource(rows);
    const blocks: string[] = [];
    for (const src of DEFAULT_ENRICHMENT_SOURCES) {
        const row = latestBySource.get(src);
        if (!row) {
            continue;
        }
        let payload = '';
        if (row.payload !== null && row.payload !== undefined) {
            try {
                payload = JSON.stringify(row.payload);
            } catch {
                payload = '';
            }
        }
        if (payload.length > MAX_SOURCE_CONTEXT_PAYLOAD_LENGTH) {
            payload = `${payload.slice(0, MAX_SOURCE_CONTEXT_PAYLOAD_LENGTH)}...`;
        }
        blocks.push(
            [
                `Source: ${row.source}`,
                row.source_url ? `Source URL: ${row.source_url}` : null,
                row.summary?.trim() ? `Summary: ${row.summary.trim()}` : null,
                payload ? `Payload: ${payload}` : null,
            ]
                .filter((line): line is string => Boolean(line))
                .join('\n'),
        );
    }
    return blocks.join('\n\n---\n\n');
}
