import { EnrichmentSource, LeadEnrichment, Prisma } from '@/generated/prisma';
import { SOURCE_ORDER } from '../constants/enrichment.constants';

const MAX_ENRICHMENT_SUMMARY_LENGTH = 32000;
const MAX_SOURCE_CONTEXT_PAYLOAD_LENGTH = 4000;

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
    return '(enriched)';
}

export function latestEnrichmentBySource(rows: LeadEnrichment[]): Map<EnrichmentSource, LeadEnrichment> {
    const latestBySource = new Map<EnrichmentSource, LeadEnrichment>();
    for (const row of rows) {
        if (!latestBySource.has(row.source)) {
            latestBySource.set(row.source, row);
        }
    }
    return latestBySource;
}

export function buildDeterministicLeadEnrichmentSummary(rows: LeadEnrichment[]): string | null {
    const latestBySource = latestEnrichmentBySource(rows);
    const parts: string[] = [];
    for (const src of SOURCE_ORDER) {
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

export function coerceLeadEnrichmentMetadata(raw: unknown): Prisma.InputJsonValue | null {
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

export function formatLeadEnrichmentRowsForSummary(rows: LeadEnrichment[]): string {
    const latestBySource = latestEnrichmentBySource(rows);
    const blocks: string[] = [];
    for (const src of SOURCE_ORDER) {
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

export async function recomputeLeadEnrichmentSummary(
    tx: Prisma.TransactionClient,
    leadUuid: string,
): Promise<void> {
    const rows = await tx.leadEnrichment.findMany({
        where: { lead_uuid: leadUuid },
        orderBy: { created_at: 'desc' },
    });
    await tx.lead.update({
        where: { uuid: leadUuid },
        data: {
            enrichment_summary: buildDeterministicLeadEnrichmentSummary(rows),
            enrichment_metadata: null,
        },
    });
}
