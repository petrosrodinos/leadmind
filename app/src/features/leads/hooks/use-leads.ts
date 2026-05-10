import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnrichmentSource } from "@/features/filters/constants/enrichment-sources";
import { enrichLead, getLead, listLeadEnrichments, listLeads } from "../services/leads.service";
import type { ListLeadEnrichmentsQuery, ListLeadsQuery } from "../interfaces/lead.interface";
import { toast } from "@/hooks/use-toast";

export const leadsQueryKeys = {
    all: ["leads"] as const,
    list: (query: ListLeadsQuery) => ["leads", "list", query] as const,
    detail: (uuid: string) => ["leads", "detail", uuid] as const,
    enrichments: (uuid: string, query: ListLeadEnrichmentsQuery) =>
        ["leads", "enrichments", uuid, query] as const,
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

export function useLeadEnrichments(
    uuid: string | null | undefined,
    query: ListLeadEnrichmentsQuery,
) {
    return useQuery({
        queryKey: uuid ? leadsQueryKeys.enrichments(uuid, query) : ["leads", "enrichments", "none"],
        queryFn: () => listLeadEnrichments(uuid as string, query),
        enabled: !!uuid,
    });
}

export function useEnrichLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; sources?: EnrichmentSource[] }) =>
            enrichLead(vars.uuid, { sources: vars.sources }),
        onSuccess: (_data, vars) => {
            toast({
                title: "Enrichment queued",
                description: "We'll refresh the lead's public summary shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: leadsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: ["leads", "enrichments", vars.uuid] });
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
