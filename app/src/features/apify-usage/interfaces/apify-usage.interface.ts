export type ApifyUsageOperation =
    | "FILTER_SCRAPE"
    | "ENRICHMENT_LINKEDIN"
    | "ENRICHMENT_WEBSITE"
    | "ENRICHMENT_GOOGLE_SEARCH"
    | "CONTACT_EMAIL_SCRAPE"
    | "AI_WEBSITE_CONTEXT"
    | "OTHER";

export type ApifyUsageStatus = "SUCCESS" | "ERROR";

export interface ApifyUsageLog {
    uuid: string;
    user_uuid: string;
    actor_id: string;
    operation: ApifyUsageOperation;
    status: ApifyUsageStatus;
    result_count: number | null;
    duration_ms: number | null;
    compute_units: number | null;
    total_cost_usd: number | null;
    run_id: string | null;
    reference_type: string | null;
    reference_uuid: string | null;
    error_message: string | null;
    created_at: string;
}

export interface ListApifyUsageQuery {
    page?: number;
    limit?: number;
    actor_id?: string;
    operation?: ApifyUsageOperation;
    status?: ApifyUsageStatus;
    from?: string;
    to?: string;
}

export interface ApifyUsageSummaryQuery {
    from?: string;
    to?: string;
}

export interface ApifyUsageSummary {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_result_count: number;
    total_compute_units: number;
    total_cost_usd: number;
    by_operation: Array<{ operation: ApifyUsageOperation; requests: number; total_cost_usd: number }>;
    by_actor: Array<{ actor_id: string; requests: number; total_cost_usd: number }>;
}

export interface ListApifyUsageResult {
    data: ApifyUsageLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}
