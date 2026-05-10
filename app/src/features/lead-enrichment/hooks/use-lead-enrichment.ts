import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import { leadsQueryKeys } from "@/features/leads/hooks/use-leads";
import { toast } from "@/hooks/use-toast";
import type { ListLeadEnrichmentsQuery } from "../interfaces/lead-enrichment.interfaces";
import { enrichLead, listLeadEnrichments } from "../services/lead-enrichment.services";

export const leadEnrichmentQueryKeys = {
    all: ["lead-enrichment"] as const,
    list: (uuid: string, query: ListLeadEnrichmentsQuery) =>
        ["lead-enrichment", "list", uuid, query] as const,
};

export function useLeadEnrichments(uuid: string | null | undefined, query: ListLeadEnrichmentsQuery) {
    return useQuery({
        queryKey: uuid ? leadEnrichmentQueryKeys.list(uuid, query) : ["lead-enrichment", "list", "none", query],
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
            qc.invalidateQueries({ queryKey: [...leadEnrichmentQueryKeys.all, "list", vars.uuid] });
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
