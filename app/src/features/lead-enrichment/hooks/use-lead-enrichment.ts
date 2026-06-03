import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import { leadsQueryKeys } from "@/features/leads/hooks/use-leads";
import { toast } from "@/hooks/use-toast";
import type { ListLeadEnrichmentsQuery } from "../interfaces/lead-enrichment.interfaces";
import { enrichLead, enrichLeadsBulk, listLeadEnrichments } from "../services/lead-enrichment.services";

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
        mutationFn: (vars: { uuid: string; sources?: EnrichmentSource[]; use_batch?: boolean }) =>
            enrichLead(vars.uuid, { sources: vars.sources, use_batch: vars.use_batch }),
        onSuccess: (data, vars) => {
            if (data.is_batch && "batch_id" in data && data.batch_id) {
                toast({
                    title: "Batch enrichment submitted",
                    description: `${data.queued} OpenAI request${data.queued === 1 ? "" : "s"} queued — source summaries and combined enrichment within 24h (50% cheaper).`,
                    duration: 5000,
                });
            } else if (data.is_batch && "gemi_only" in data && data.gemi_only) {
                toast({
                    title: "Enrichment complete",
                    description: "Registry (GEMI) data refreshed; combined summary updated.",
                    duration: 3500,
                });
            } else {
                toast({
                    title: "Enrichment queued",
                    description: "We'll refresh the lead's public summary shortly.",
                    duration: 2500,
                });
            }
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

export function useEnrichLeadsBulk() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuids: string[]; sources?: EnrichmentSource[]; use_batch?: boolean }) =>
            enrichLeadsBulk({ uuids: vars.uuids, sources: vars.sources, use_batch: vars.use_batch }),
        onSuccess: (data, vars) => {
            const n = vars.uuids.length;
            if (data.is_batch && "batch_id" in data && data.batch_id) {
                toast({
                    title: "Batch enrichment submitted",
                    description: `${data.queued} OpenAI request${data.queued === 1 ? "" : "s"} for ${n} lead${n === 1 ? "" : "s"} — results within 24h (50% cheaper).`,
                    duration: 5000,
                });
            } else if (data.is_batch && "prepare_job_id" in data) {
                toast({
                    title: "Batch enrichment started",
                    description: `${n} lead${n === 1 ? "" : "s"} are being prepared (scraping sources), then submitted to OpenAI Batch — results within 24h.`,
                    duration: 5000,
                });
            } else if (data.is_batch && "gemi_only" in data && data.gemi_only) {
                toast({
                    title: "Enrichment complete",
                    description: `Registry (GEMI) refreshed for ${n} lead${n === 1 ? "" : "s"}.`,
                    duration: 3500,
                });
            } else {
                toast({
                    title: "Enrichment queued",
                    description: `${n} lead${n === 1 ? "" : "s"} will refresh shortly.`,
                    duration: 2500,
                });
            }
            qc.invalidateQueries({ queryKey: leadsQueryKeys.all });
            for (const uuid of vars.uuids) {
                qc.invalidateQueries({ queryKey: leadsQueryKeys.detail(uuid) });
                qc.invalidateQueries({ queryKey: [...leadEnrichmentQueryKeys.all, "list", uuid] });
            }
        },
        onError: (error: Error) => {
            toast({
                title: "Could not enrich leads",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
