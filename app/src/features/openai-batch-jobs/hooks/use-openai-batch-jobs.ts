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
    });
}
