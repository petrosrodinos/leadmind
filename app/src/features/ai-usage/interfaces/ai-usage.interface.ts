export type AiUsageOperation =
    | "LEAD_ENRICH"
    | "CONTACT_SCORE"
    | "CONTACT_DRAFT"
    | "CAMPAIGN_DRAFT"
    | "ENRICHMENT_SUMMARY"
    | "AUDIENCE_ANALYSIS"
    | "EMBEDDING"
    | "ADMIN_GENERATE"
    | "BATCH_JOB"
    | "OTHER";

export type AiUsageRequestMode = "SYNC" | "BATCH" | "STREAM";
export type AiUsageStatus = "SUCCESS" | "ERROR";

export interface AiUsageLog {
    uuid: string;
    user_uuid: string;
    provider: string;
    model: string;
    operation: AiUsageOperation;
    request_mode: AiUsageRequestMode;
    status: AiUsageStatus;
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
    input_cost_usd: number | null;
    output_cost_usd: number | null;
    total_cost_usd: number | null;
    duration_ms: number | null;
    reference_type: string | null;
    reference_uuid: string | null;
    batch_id: string | null;
    custom_id: string | null;
    error_message: string | null;
    created_at: string;
}

export interface ListAiUsageQuery {
    page?: number;
    limit?: number;
    provider?: string;
    operation?: AiUsageOperation;
    status?: AiUsageStatus;
    from?: string;
    to?: string;
}

export interface AiUsageSummaryQuery {
    from?: string;
    to?: string;
}

export interface AiUsageSummary {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
    by_provider: Array<{ provider: string; requests: number; total_cost_usd: number }>;
    by_operation: Array<{ operation: AiUsageOperation; requests: number; total_cost_usd: number }>;
}

export interface ListAiUsageResult {
    data: AiUsageLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}
