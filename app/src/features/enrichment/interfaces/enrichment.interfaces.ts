import type { EnrichmentSource } from "@/features/enrichment/constants/enrichment-sources";

export type EnrichmentEntityKind = "lead" | "contact";

export interface ListEnrichmentsQuery {
    page?: number;
    limit?: number;
    search?: string;
    source?: EnrichmentSource;
}

export interface EnrichmentRow {
    uuid: string;
    entity_kind: EnrichmentEntityKind;
    entity_uuid: string;
    source: EnrichmentSource;
    source_url: string | null;
    summary: string | null;
    payload: Record<string, unknown> | unknown[] | null;
    cost_usd: number | null;
    input_tokens: number | null;
    output_tokens: number | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface PaginatedEnrichments {
    data: EnrichmentRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type EnrichLeadResponse =
    | { jobId: string; is_batch: false }
    | { batch_id: string; queued: number; is_batch: true }
    | { jobId: string; queued: number; is_batch: true; gemi_only: true };

export type BulkEnrichLeadsResponse =
    | { jobIds: string[]; queued: number; is_batch: false }
    | { batch_id: string; queued: number; is_batch: true }
    | { prepare_job_id: string; queued: number; is_batch: true }
    | { jobIds: string[]; queued: number; is_batch: true; gemi_only: true };

export type EnrichContactResponse = { jobId: string };
