import type { ContactAudienceStats } from "./contact-audience-stats.interface";

export type ContactAudienceAnalysisScope = "FILTER" | "LIST";

export type ContactAudienceAnalysisStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface AudienceAnalysisComparison {
    summary: string;
    changed: string[];
    unchanged: string[];
}

export interface ContactAudienceAnalysisContent {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    risks: string[];
    comparison?: AudienceAnalysisComparison | null;
}

export interface ContactAudienceAnalysis {
    uuid: string;
    scope: ContactAudienceAnalysisScope;
    filter_uuid: string | null;
    contact_list_uuid: string | null;
    audience_name: string;
    stats_snapshot: ContactAudienceStats;
    analysis: ContactAudienceAnalysisContent | Record<string, never>;
    status: ContactAudienceAnalysisStatus;
    error: string | null;
    provider: string | null;
    model: string | null;
    input_tokens: number | null;
    output_tokens: number | null;
    cost_usd: number | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedContactAudienceAnalyses {
    items: ContactAudienceAnalysis[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface ListContactAudienceAnalysesQuery {
    page?: number;
    limit?: number;
}
