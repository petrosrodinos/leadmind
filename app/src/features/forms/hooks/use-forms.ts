import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createForm, deleteForm, duplicateForm, getForm, listForms, updateForm } from "../services/form.service";
import type { CreateFormPayload, ListFormsQuery, UpdateFormPayload } from "../interfaces/form.interface";
import { toast } from "@/hooks/use-toast";

export const formQueryKeys = {
    all: ["forms"] as const,
    list: (query: ListFormsQuery) => ["forms", "list", query] as const,
    detail: (uuid: string) => ["forms", "detail", uuid] as const,
};

export function useForms(query: ListFormsQuery = {}) {
    return useQuery({
        queryKey: formQueryKeys.list(query),
        queryFn: () => listForms(query),
        staleTime: 30_000,
    });
}

export function useForm(uuid: string) {
    return useQuery({
        queryKey: formQueryKeys.detail(uuid),
        queryFn: () => getForm(uuid),
        staleTime: 30_000,
        enabled: !!uuid,
    });
}

export function useCreateForm() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFormPayload) => createForm(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.all });
            toast({ title: "Form created", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not create form", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useUpdateForm() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateFormPayload }) =>
            updateForm(vars.uuid, vars.payload),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: formQueryKeys.all });
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(vars.uuid) });
            toast({ title: "Form updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not update form", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useDeleteForm() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteForm(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.all });
            toast({ title: "Form deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not delete form", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useDuplicateForm() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => duplicateForm(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.all });
            toast({ title: "Form duplicated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not duplicate form", description: error.message, duration: 3000, variant: "error" });
        },
    });
}
