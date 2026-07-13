import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createMessageTemplate,
    createTemplateFromCampaign,
    createTemplateFromMessage,
    deleteMessageTemplate,
    generateTemplateMessage,
    listMessageTemplates,
    updateMessageTemplate,
} from "../services/message-templates.service";
import type {
    CreateMessageTemplatePayload,
    CreateTemplateFromSourcePayload,
    GenerateTemplateMessagePayload,
    UpdateMessageTemplatePayload,
} from "../interfaces/message-template.interface";
import { toast } from "@/hooks/use-toast";

export const messageTemplatesQueryKeys = {
    all: ["message-templates"] as const,
    list: () => ["message-templates", "list"] as const,
};

export function useMessageTemplates() {
    return useQuery({
        queryKey: messageTemplatesQueryKeys.list(),
        queryFn: listMessageTemplates,
        staleTime: 30_000,
    });
}

export function useCreateMessageTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMessageTemplatePayload) => createMessageTemplate(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: messageTemplatesQueryKeys.all });
            toast({ title: "Template created", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create template",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useUpdateMessageTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateMessageTemplatePayload }) =>
            updateMessageTemplate(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: messageTemplatesQueryKeys.all });
            toast({ title: "Template saved", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save template",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useDeleteMessageTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteMessageTemplate(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: messageTemplatesQueryKeys.all });
            toast({ title: "Template deleted", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete template",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useGenerateTemplateMessage() {
    return useMutation({
        mutationFn: (payload: GenerateTemplateMessagePayload) => generateTemplateMessage(payload),
        onError: (error: Error) => {
            toast({
                title: "AI generation failed",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useCreateTemplateFromCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { campaignUuid: string; payload?: CreateTemplateFromSourcePayload }) =>
            createTemplateFromCampaign(vars.campaignUuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: messageTemplatesQueryKeys.all });
            toast({ title: "Template created from campaign", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create template",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useCreateTemplateFromMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { messageUuid: string; payload?: CreateTemplateFromSourcePayload }) =>
            createTemplateFromMessage(vars.messageUuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: messageTemplatesQueryKeys.all });
            toast({ title: "Template created from message", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create template",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}
