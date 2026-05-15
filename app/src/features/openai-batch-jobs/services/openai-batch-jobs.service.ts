import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { ListBatchJobsQuery, ListBatchJobsResult } from "../interfaces/openai-batch-job.interface";

export const listBatchJobs = async (query: ListBatchJobsQuery): Promise<ListBatchJobsResult> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.type) params.set("type", query.type);
    if (query.status) params.set("status", query.status);

    const response = await axiosInstance.get(`${ApiRoutes.admin.batch_jobs}?${params.toString()}`);
    return response.data;
};
