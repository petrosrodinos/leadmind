import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createFormField,
    deleteFormField,
    reorderFormFields,
    updateFormField,
} from "../services/form-field.service";
import type {
    CreateFormFieldPayload,
    ReorderFormFieldsPayload,
    UpdateFormFieldPayload,
} from "../interfaces/form.interface";
import { formQueryKeys } from "./use-forms";
import { toast } from "@/hooks/use-toast";

export function useCreateFormField(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFormFieldPayload) => createFormField(formUuid, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            toast({ title: "Field added", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not add field", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useUpdateFormField(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { fieldUuid: string; payload: UpdateFormFieldPayload }) =>
            updateFormField(formUuid, vars.fieldUuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            toast({ title: "Field updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not update field", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useDeleteFormField(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (fieldUuid: string) => deleteFormField(formUuid, fieldUuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            toast({ title: "Field deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({ title: "Could not delete field", description: error.message, duration: 3000, variant: "error" });
        },
    });
}

export function useReorderFormFields(formUuid: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: ReorderFormFieldsPayload) => reorderFormFields(formUuid, payload),
        onError: (error: Error) => {
            qc.invalidateQueries({ queryKey: formQueryKeys.detail(formUuid) });
            toast({ title: "Could not reorder fields", description: error.message, duration: 3000, variant: "error" });
        },
    });
}
