import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLead, listLeads, updateLead } from "../services/leads.service";
import type { ListLeadsQuery, UpdateLeadPayload } from "../interfaces/lead.interface";
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

export function useUpdateLead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateLeadPayload }) =>
            updateLead(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: leadsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: leadsQueryKeys.all });
            toast({ title: "Lead updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update lead",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useLead(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? leadsQueryKeys.detail(uuid) : ["leads", "detail", "none"],
        queryFn: () => getLead(uuid as string),
        enabled: !!uuid,
    });
}
