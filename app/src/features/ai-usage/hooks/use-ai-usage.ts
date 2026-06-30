import { useQuery } from "@tanstack/react-query";
import { listAiUsage } from "../services/ai-usage.service";
import type { ListAiUsageQuery } from "../interfaces/ai-usage.interface";

export const aiUsageQueryKeys = {
    all: ["ai-usage"] as const,
    list: (query: ListAiUsageQuery) => [...aiUsageQueryKeys.all, "list", query] as const,
};

export function useAiUsage(query: ListAiUsageQuery) {
    return useQuery({
        queryKey: aiUsageQueryKeys.list(query),
        queryFn: () => listAiUsage(query),
        placeholderData: (prev) => prev,
    });
}
