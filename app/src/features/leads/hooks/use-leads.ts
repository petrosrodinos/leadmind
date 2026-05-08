import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrichLead, getLead, listLeads } from "../services/leads.service";
import type { ListLeadsQuery } from "../interfaces/lead.interface";
import { toast } from "@/hooks/use-toast";

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

export function useEnrichLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => enrichLead(uuid),
        onSuccess: (_, uuid) => {
            toast({
                title: "Enrichment queued",
                description: "We'll refresh the lead's public summary shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: leadsQueryKeys.detail(uuid) });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not enrich lead",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
