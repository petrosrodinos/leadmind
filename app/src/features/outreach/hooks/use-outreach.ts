import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createAndSendMessage,
    createDraftMessage,
    deleteOutreachMessage,
    sendOutreachMessage,
    updateOutreachMessage,
} from "../services/outreach.service";
import type {
    CreateMessagePayload,
    UpdateMessagePayload,
} from "@/features/contacts/interfaces/contact.interface";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";
import { toast } from "@/hooks/use-toast";

interface MessageMutationContext {
    contact_uuid?: string;
    campaign_uuid?: string;
}

const invalidateAfterMessageChange = (
    qc: ReturnType<typeof useQueryClient>,
    vars: MessageMutationContext,
) => {
    qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
    if (vars.contact_uuid) {
        qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.contact_uuid) });
        qc.invalidateQueries({ queryKey: contactsQueryKeys.messages(vars.contact_uuid) });
    }
    if (vars.campaign_uuid) {
        qc.invalidateQueries({ queryKey: ["marketing-campaigns", "draft-messages", vars.campaign_uuid] });
        qc.invalidateQueries({ queryKey: ["marketing-campaigns", "detail", vars.campaign_uuid] });
    }
};

export function useUpdateOutreachMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateMessagePayload } & MessageMutationContext) =>
            updateOutreachMessage(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            invalidateAfterMessageChange(qc, vars);
            toast({ title: "Draft saved", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save draft",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useSendOutreachMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string } & MessageMutationContext) =>
            sendOutreachMessage(vars.uuid),
        onSuccess: (_data, vars) => {
            invalidateAfterMessageChange(qc, vars);
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

export function useCreateDraftMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMessagePayload) => createDraftMessage(payload),
        onSuccess: (_data, payload) => {
            invalidateAfterMessageChange(qc, { contact_uuid: payload.contact_uuid });
            toast({ title: "Draft saved", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save draft",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useCreateAndSendMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMessagePayload) => createAndSendMessage(payload),
        onSuccess: (_data, payload) => {
            invalidateAfterMessageChange(qc, { contact_uuid: payload.contact_uuid });
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

export function useDeleteOutreachMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string } & MessageMutationContext) =>
            deleteOutreachMessage(vars.uuid),
        onSuccess: (_data, vars) => {
            invalidateAfterMessageChange(qc, vars);
            toast({ title: "Draft deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete draft",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
