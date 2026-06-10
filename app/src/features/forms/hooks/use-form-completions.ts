import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createFormCompletion,
    deleteFormCompletion,
    getContactCompletions,
    listFormCompletions,
    updateFormCompletion,
} from "../services/form-completion.service";
import type {
    CreateCompletionPayload,
    ListCompletionsQuery,
    UpdateCompletionPayload,
} from "../interfaces/form-completion.interface";
import { formQueryKeys } from "./use-forms";
import { toast } from "@/hooks/use-toast";

export const completionQueryKeys = {
    all: (formUuid: string) => ["forms", formUuid, "completions"] as const,
    list: (formUuid: string, query: ListCompletionsQuery) =>
        ["forms", formUuid, "completions", "list", query] as const,
    contactAll: (contactUuid: string) => ["form-completions", "contact", contactUuid] as const,
};

export function useFormCompletions(formUuid: string, query: ListCompletionsQuery = {}) {
    return useQuery({
        queryKey: completionQueryKeys.list(formUuid, query),
        queryFn: () => listFormCompletions(formUuid, query),
        staleTime: 30_000,
        enabled: !!formUuid,
    });
}

export function useContactCompletions(contactUuid: string) {
    return useQuery({
        queryKey: completionQueryKeys.contactAll(contactUuid),
        queryFn: () => getContactCompletions(contactUuid),
        staleTime: 30_000,
        enabled: !!contactUuid,
    });
}

export function useCreateFormCompletion(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCompletionPayload) => createFormCompletion(formUuid, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: completionQueryKeys.all(formUuid) });
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            qc.invalidateQueries({ queryKey: ["form-completions"] });
            toast({ title: "Form submitted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not submit form", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useUpdateFormCompletion(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { completionUuid: string; payload: UpdateCompletionPayload }) =>
            updateFormCompletion(formUuid, vars.completionUuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: completionQueryKeys.all(formUuid) });
            toast({ title: "Completion updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not update completion", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useDeleteFormCompletion(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (completionUuid: string) => deleteFormCompletion(formUuid, completionUuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: completionQueryKeys.all(formUuid) });
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            qc.invalidateQueries({ queryKey: ["form-completions"] });
            toast({ title: "Completion deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not delete completion", description: error.message, duration: 3000, variant: "error" });
        },
    });
}
