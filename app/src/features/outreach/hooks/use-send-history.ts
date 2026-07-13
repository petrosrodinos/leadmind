import { useQuery } from "@tanstack/react-query";
import { listOutreachMessages } from "../services/outreach.service";
import type { ListSendHistoryQuery } from "../interfaces/send-history.interface";

export const sendHistoryQueryKeys = {
    all: ["send-history"] as const,
    list: (query: ListSendHistoryQuery) => ["send-history", "list", query] as const,
};

export function useSendHistory(query: ListSendHistoryQuery) {
    return useQuery({
        queryKey: sendHistoryQueryKeys.list(query),
        queryFn: () => listOutreachMessages(query),
        placeholderData: (prev) => prev,
    });
}
