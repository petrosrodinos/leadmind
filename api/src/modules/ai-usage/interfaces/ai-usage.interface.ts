import {
    AiUsageOperation,
    AiUsageRequestMode,
    AiUsageStatus,
    Prisma,
} from '@/generated/prisma';

export interface CreateAiUsageLogInput {
    user_uuid: string;
    provider: string;
    model: string;
    operation: AiUsageOperation;
    request_mode?: AiUsageRequestMode;
    status: AiUsageStatus;
    input_tokens?: number | null;
    output_tokens?: number | null;
    total_tokens?: number | null;
    input_cost_usd?: number | null;
    output_cost_usd?: number | null;
    total_cost_usd?: number | null;
    duration_ms?: number | null;
    reference_type?: string | null;
    reference_uuid?: string | null;
    batch_id?: string | null;
    custom_id?: string | null;
    error_message?: string | null;
    metadata?: Prisma.InputJsonValue;
}

export interface AiUsageSummaryResponse {
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
