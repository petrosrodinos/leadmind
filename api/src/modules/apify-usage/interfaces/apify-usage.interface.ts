import { ApifyUsageOperation, ApifyUsageStatus, Prisma } from '@/generated/prisma';

export interface CreateApifyUsageLogInput {
    user_uuid: string;
    actor_id: string;
    operation: ApifyUsageOperation;
    status: ApifyUsageStatus;
    result_count?: number | null;
    duration_ms?: number | null;
    compute_units?: number | null;
    total_cost_usd?: number | null;
    run_id?: string | null;
    reference_type?: string | null;
    reference_uuid?: string | null;
    error_message?: string | null;
    metadata?: Prisma.InputJsonValue;
}

export interface ApifyUsageSummaryResponse {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_result_count: number;
    total_compute_units: number;
    total_cost_usd: number;
    by_operation: Array<{
        operation: ApifyUsageOperation;
        requests: number;
        total_cost_usd: number;
    }>;
    by_actor: Array<{ actor_id: string; requests: number; total_cost_usd: number }>;
}
