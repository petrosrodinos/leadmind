import { useQuery } from "@tanstack/react-query";
import { listApifyUsage } from "../services/apify-usage.service";
import type { ListApifyUsageQuery } from "../interfaces/apify-usage.interface";

export const apifyUsageQueryKeys = {
    all: ["apify-usage"] as const,
    list: (query: ListApifyUsageQuery) => [...apifyUsageQueryKeys.all, "list", query] as const,
};

export function useApifyUsage(query: ListApifyUsageQuery) {
    return useQuery({
        queryKey: apifyUsageQueryKeys.list(query),
        queryFn: () => listApifyUsage(query),
        placeholderData: (prev) => prev,
    });
}
