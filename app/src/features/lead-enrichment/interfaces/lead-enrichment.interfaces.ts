import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";

export interface ListLeadEnrichmentsQuery {
    page?: number;
    limit?: number;
    search?: string;
    source?: EnrichmentSource;
}

export interface LeadEnrichment {
    uuid: string;
    lead_uuid: string;
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

export interface PaginatedLeadEnrichments {
    data: LeadEnrichment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
