import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cancelCampaign,
    createCampaign,
    deleteCampaign,
    deleteCampaignDraftMessage,
    duplicateCampaign,
    generateCampaignMessage,
    getCampaign,
    listCampaignContacts,
    listCampaignDraftMessages,
    listCampaigns,
    previewCampaignContacts,
    rerunCampaign,
    scheduleCampaign,
    sendCampaignDraftMessage,
    sendPersonalizedDrafts,
    startCampaign,
    updateCampaign,
} from "../services/marketing-campaigns.service";
import type {
    CampaignFilters,
    CampaignStatuses,
    CreateCampaignPayload,
    GenerateCampaignMessagePayload,
    SendCampaignDraftsPayload,
    SendCampaignDraftMessagePayload,
    StartCampaignPayload,
    ListCampaignContactsQuery,
    ListCampaignsQuery,
    MarketingCampaign,
    UpdateCampaignPayload,
} from "../interfaces/campaign.interface";
import { CampaignStatuses as CS, CampaignType } from "../interfaces/campaign.interface";
import { toast } from "@/hooks/use-toast";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";

export const campaignsQueryKeys = {
    all: ["marketing-campaigns"] as const,
    list: (query: ListCampaignsQuery) => ["marketing-campaigns", "list", query] as const,
    detail: (uuid: string) => ["marketing-campaigns", "detail", uuid] as const,
    contacts: (uuid: string, query: ListCampaignContactsQuery) =>
        ["marketing-campaigns", "contacts", uuid, query] as const,
};

const isActiveStatus = (status: CampaignStatuses) =>
    status === CS.SENDING || status === CS.SCHEDULED;

function invalidateCampaignDraftMessageQueries(
    qc: ReturnType<typeof useQueryClient>,
    vars: { campaignUuid: string; contactUuid?: string },
) {
    qc.invalidateQueries({ queryKey: ["marketing-campaigns", "draft-messages", vars.campaignUuid] });
    qc.invalidateQueries({ queryKey: ["marketing-campaigns", "contacts", vars.campaignUuid] });
    qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(vars.campaignUuid) });
    qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
    if (vars.contactUuid) {
        qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.contactUuid) });
        qc.invalidateQueries({ queryKey: contactsQueryKeys.messages(vars.contactUuid) });
    }
    qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
}

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
        mutationFn: (vars: { uuid: string } & StartCampaignPayload) =>
            startCampaign(vars.uuid, {
                email_provider_allocations: vars.email_provider_allocations,
                sender_profile_uuid: vars.sender_profile_uuid,
            }),
        onSuccess: (data, vars) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            const isPersonalized = data.campaign_type === CampaignType.PERSONALIZED;
            const batchQueued = isPersonalized && !!data.draft_batch_id;
            toast({
                title: isPersonalized
                    ? batchQueued
                        ? "Draft generation queued"
                        : "Drafts generated"
                    : "Campaign queued for dispatch",
                description: isPersonalized
                    ? batchQueued
                        ? "OpenAI Batch API will create drafts within 24 hours. Check back to review and send."
                        : "Review your drafts and send when ready."
                    : undefined,
                duration: 3000,
            });
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

export function useDuplicateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => duplicateCampaign(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign duplicated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not duplicate campaign",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRerunCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => rerunCampaign(uuid),
        onSuccess: (_data, uuid) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign queued for re-run", duration: 2500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not re-run campaign",
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

export function useSendPersonalizedDrafts() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string } & SendCampaignDraftsPayload) =>
            sendPersonalizedDrafts(vars.uuid, {
                email_provider_allocations: vars.email_provider_allocations,
                sender_profile_uuid: vars.sender_profile_uuid,
            }),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: campaignsQueryKeys.all });
            toast({ title: "Campaign dispatching", description: "Messages are being sent.", duration: 2500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not send drafts",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useCampaignDraftMessages(uuid: string | null | undefined, query: { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: ["marketing-campaigns", "draft-messages", uuid, query],
        queryFn: () => listCampaignDraftMessages(uuid as string, query),
        enabled: !!uuid,
        placeholderData: (prev) => prev,
    });
}

export function useDeleteCampaignDraftMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { campaignUuid: string; messageUuid: string; contactUuid?: string }) =>
            deleteCampaignDraftMessage(vars.campaignUuid, vars.messageUuid),
        onSuccess: (_data, vars) => {
            invalidateCampaignDraftMessageQueries(qc, vars);
            toast({ title: "Message removed", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not remove message",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useSendCampaignDraftMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            campaignUuid: string;
            messageUuid: string;
            contactUuid?: string;
        } & SendCampaignDraftMessagePayload) =>
            sendCampaignDraftMessage(vars.campaignUuid, vars.messageUuid, {
                email_provider: vars.email_provider,
                email_account: vars.email_account,
                sender_profile_uuid: vars.sender_profile_uuid,
            }),
        onSuccess: (_data, vars) => {
            invalidateCampaignDraftMessageQueries(qc, vars);
            toast({
                title: "Message queued for send",
                description: "We'll update its status when delivery completes.",
                duration: 2500,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not send message",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
