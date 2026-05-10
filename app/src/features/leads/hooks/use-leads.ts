import { useQuery } from "@tanstack/react-query";
import { getLead, listLeads } from "../services/leads.service";
import type { ListLeadsQuery } from "../interfaces/lead.interface";

export const leadsQueryKeys = {
    all: ["leads"] as const,
    list: (query: ListLeadsQuery) => ["leads", "list", query] as const,
    detail: (uuid: string) => ["leads", "detail", uuid] as const,
};

export function useLeads(query: ListLeadsQuery) {
    return useQuery({
        queryKey: leadsQueryKeys.list(query),
        queryFn: () => listLeads(query),
        placeholderData: (prev) => prev,
    });
}

export function useLead(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? leadsQueryKeys.detail(uuid) : ["leads", "detail", "none"],
        queryFn: () => getLead(uuid as string),
        enabled: !!uuid,
    });
}
