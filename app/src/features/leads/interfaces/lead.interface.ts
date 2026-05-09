import type { EnrichmentSource } from "@/features/filters/constants/enrichment-sources";

export const SourceType = {
    LINKEDIN: "LINKEDIN",
    GOOGLE_MAPS: "GOOGLE_MAPS",
    GOOGLE_SEARCH: "GOOGLE_SEARCH",
    GENERIC_LEAD: "GENERIC_LEAD",
    WEBSITE_CRAWLER: "WEBSITE_CRAWLER",
    GEMI: "GEMI",
    MANUAL: "MANUAL",
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export interface Lead {
    uuid: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
    linkedin_url: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    description: string | null;
    source_type: SourceType;
    enrichment_summary: string | null;
    raw_data: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface ListLeadsQuery {
    page?: number;
    limit?: number;
    search?: string;
    source_type?: SourceType;
}

export interface PaginatedLeads {
    data: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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
