import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cancelCampaign,
    createCampaign,
    deleteCampaign,
    generateCampaignMessage,
    getCampaign,
    listCampaignContacts,
    listCampaigns,
    previewCampaignContacts,
    scheduleCampaign,
    startCampaign,
    updateCampaign,
} from "../services/marketing-campaigns.service";
import type {
    CampaignFilters,
    CampaignStatus,
    CreateCampaignPayload,
    GenerateCampaignMessagePayload,
    ListCampaignContactsQuery,
    ListCampaignsQuery,
    MarketingCampaign,
    UpdateCampaignPayload,
} from "../interfaces/campaign.interface";
import { toast } from "@/hooks/use-toast";

export const campaignsQueryKeys = {
    all: ["marketing-campaigns"] as const,
    list: (query: ListCampaignsQuery) => ["marketing-campaigns", "list", query] as const,
    detail: (uuid: string) => ["marketing-campaigns", "detail", uuid] as const,
    contacts: (uuid: string, query: ListCampaignContactsQuery) =>
        ["marketing-campaigns", "contacts", uuid, query] as const,
};

const isActiveStatus = (status: CampaignStatus) =>
    status === "SENDING" || status === "SCHEDULED";

export function useCampaigns(query: ListCampaignsQuery) {
    return useQuery({
        queryKey: campaignsQueryKeys.list(query),
        queryFn: () => listCampaigns(query),
        placeholderData: (prev) => prev,
    });
}

export function useCampaign(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? campaignsQueryKeys.detail(uuid) : ["marketing-campaigns", "detail", "none"],
        queryFn: () => getCampaign(uuid as string),
        enabled: !!uuid,
        refetchInterval: (q) => {
            const c = q.state.data as MarketingCampaign | undefined;
            if (!c) return false;
            return isActiveStatus(c.status) ? 5_000 : false;
        },
    });
}

export function useCampaignContacts(
    uuid: string | null | undefined,
    query: ListCampaignContactsQuery,
) {
    return useQuery({
        queryKey: uuid
            ? campaignsQueryKeys.contacts(uuid, query)
            : ["marketing-campaigns", "contacts", "none"],
        queryFn: () => listCampaignContacts(uuid as string, query),
        enabled: !!uuid,
        placeholderData: (prev) => prev,
    });
}

export function useCreateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign created", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateCampaignPayload }) =>
            updateCampaign(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteCampaign(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function usePreviewCampaignContacts() {
    return useMutation({
        mutationFn: (vars: { uuid: string; filters: CampaignFilters }) =>
            previewCampaignContacts(vars.uuid, vars.filters),
        onError: (error: Error) => {
            toast({
                title: "Could not preview contacts",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useStartCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => startCampaign(uuid),
        onSuccess: (_data, uuid) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign queued for dispatch", duration: 2500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not start campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useScheduleCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; scheduled_at: string }) =>
            scheduleCampaign(vars.uuid, vars.scheduled_at),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign scheduled", duration: 2500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not schedule",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useCancelCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => cancelCampaign(uuid),
        onSuccess: (_data, uuid) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign cancelled", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not cancel campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useCampaignAiGenerate() {
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: GenerateCampaignMessagePayload }) =>
            generateCampaignMessage(vars.uuid, vars.payload),
        onError: (error: Error) => {
            toast({
                title: "AI generation failed",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
