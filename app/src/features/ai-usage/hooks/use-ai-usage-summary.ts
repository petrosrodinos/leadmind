import { useQuery } from "@tanstack/react-query";
import { getAiUsageSummary } from "../services/ai-usage.service";
import type { AiUsageSummaryQuery } from "../interfaces/ai-usage.interface";
import { aiUsageQueryKeys } from "./use-ai-usage";

export function useAiUsageSummary(query: AiUsageSummaryQuery = {}) {
    return useQuery({
        queryKey: [...aiUsageQueryKeys.all, "summary", query] as const,
        queryFn: () => getAiUsageSummary(query),
    });
}
