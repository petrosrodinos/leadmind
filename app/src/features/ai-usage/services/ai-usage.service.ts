import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    AiUsageSummary,
    AiUsageSummaryQuery,
    ListAiUsageQuery,
    ListAiUsageResult,
} from "../interfaces/ai-usage.interface";

function buildQueryString(query: ListAiUsageQuery | AiUsageSummaryQuery): string {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if ("page" in query && query.page) params.set("page", String(query.page));
    if ("limit" in query && query.limit) params.set("limit", String(query.limit));
    if ("provider" in query && query.provider) params.set("provider", query.provider);
    if ("operation" in query && query.operation) params.set("operation", query.operation);
    if ("status" in query && query.status) params.set("status", query.status);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export async function listAiUsage(query: ListAiUsageQuery): Promise<ListAiUsageResult> {
    const response = await axiosInstance.get(
        `${ApiRoutes.ai_usage.list}${buildQueryString(query)}`,
    );
    return response.data;
}

export async function getAiUsageSummary(query: AiUsageSummaryQuery = {}): Promise<AiUsageSummary> {
    const response = await axiosInstance.get(
        `${ApiRoutes.ai_usage.summary}${buildQueryString(query)}`,
    );
    return response.data;
}
