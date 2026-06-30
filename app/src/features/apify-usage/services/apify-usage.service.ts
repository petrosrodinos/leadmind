import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    ApifyUsageSummary,
    ApifyUsageSummaryQuery,
    ListApifyUsageQuery,
    ListApifyUsageResult,
} from "../interfaces/apify-usage.interface";

function buildQueryString(query: ListApifyUsageQuery | ApifyUsageSummaryQuery): string {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if ("page" in query && query.page) params.set("page", String(query.page));
    if ("limit" in query && query.limit) params.set("limit", String(query.limit));
    if ("actor_id" in query && query.actor_id) params.set("actor_id", query.actor_id);
    if ("operation" in query && query.operation) params.set("operation", query.operation);
    if ("status" in query && query.status) params.set("status", query.status);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export async function listApifyUsage(query: ListApifyUsageQuery): Promise<ListApifyUsageResult> {
    const response = await axiosInstance.get(
        `${ApiRoutes.apify_usage.list}${buildQueryString(query)}`,
    );
    return response.data;
}

export async function getApifyUsageSummary(
    query: ApifyUsageSummaryQuery = {},
): Promise<ApifyUsageSummary> {
    const response = await axiosInstance.get(
        `${ApiRoutes.apify_usage.summary}${buildQueryString(query)}`,
    );
    return response.data;
}
