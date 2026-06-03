import { useQuery } from "@tanstack/react-query";
import { listBatchJobs } from "../services/openai-batch-jobs.service";
import type { ListBatchJobsQuery } from "../interfaces/openai-batch-job.interface";

export const batchJobsQueryKeys = {
    all: ["openai-batch-jobs"] as const,
    list: (query: ListBatchJobsQuery) => [...batchJobsQueryKeys.all, "list", query] as const,
};

export function useBatchJobs(query: ListBatchJobsQuery) {
    return useQuery({
        queryKey: batchJobsQueryKeys.list(query),
        queryFn: () => listBatchJobs(query),
        placeholderData: (prev) => prev,
        refetchInterval: (q) => {
            const rows = q.state.data?.data ?? [];
            return rows.some((job) => job.status === "IN_PROGRESS") ? 30_000 : false;
        },
    });
}
