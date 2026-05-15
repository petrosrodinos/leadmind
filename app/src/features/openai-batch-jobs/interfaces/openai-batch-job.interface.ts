export const OpenAiBatchJobType = {
    CONTACT_SCORE: "CONTACT_SCORE",
    LEAD_ENRICH: "LEAD_ENRICH",
    MESSAGE_CREATE: "MESSAGE_CREATE",
} as const;
export type OpenAiBatchJobType = (typeof OpenAiBatchJobType)[keyof typeof OpenAiBatchJobType];

export const OpenAiBatchStatus = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
} as const;
export type OpenAiBatchStatus = (typeof OpenAiBatchStatus)[keyof typeof OpenAiBatchStatus];

export interface OpenAiBatchJob {
    id: string;
    batch_id: string;
    user_uuid: string;
    type: OpenAiBatchJobType;
    status: OpenAiBatchStatus;
    total_requests: number;
    completed_requests: number;
    failed_requests: number;
    input_file_id: string | null;
    output_file_id: string | null;
    error_file_id: string | null;
    expires_at: string | null;
    finished_at: string | null;
    created_at: string;
    updated_at: string;
    user: { uuid: string; email: string };
}

export interface ListBatchJobsQuery {
    page?: number;
    limit?: number;
    type?: OpenAiBatchJobType;
    status?: OpenAiBatchStatus;
}

export interface ListBatchJobsResult {
    data: OpenAiBatchJob[];
    total: number;
    page: number;
    limit: number;
}
