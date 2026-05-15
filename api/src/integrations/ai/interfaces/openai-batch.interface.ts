export interface OpenAiBatchCreateResult {
    batch_id: string;
    input_file_id: string;
    expires_at: Date | null;
}

export interface OpenAiBatchRequest {
    custom_id: string;
    messages: { role: string; content: string }[];
    model: string;
    response_format?: { type: 'json_object' };
}

export interface OpenAiBatchResult {
    custom_id: string;
    status_code: number;
    content: string | null;
    error: string | null;
}

// Keep in sync with Prisma enums OpenAiBatchJobType / OpenAiBatchStatus
export const OpenAiBatchJobType = {
    CONTACT_SCORE: 'CONTACT_SCORE',
    LEAD_ENRICH: 'LEAD_ENRICH',
    MESSAGE_CREATE: 'MESSAGE_CREATE',
} as const;

export const OpenAiBatchStatus = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
} as const;
