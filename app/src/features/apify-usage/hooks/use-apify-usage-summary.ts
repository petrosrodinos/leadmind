import { useQuery } from "@tanstack/react-query";
import { getApifyUsageSummary } from "../services/apify-usage.service";
import type { ApifyUsageSummaryQuery } from "../interfaces/apify-usage.interface";
import { apifyUsageQueryKeys } from "./use-apify-usage";

export function useApifyUsageSummary(query: ApifyUsageSummaryQuery = {}) {
    return useQuery({
        queryKey: [...apifyUsageQueryKeys.all, "summary", query] as const,
        queryFn: () => getApifyUsageSummary(query),
    });
}
