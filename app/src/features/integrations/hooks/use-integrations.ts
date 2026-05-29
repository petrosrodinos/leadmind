import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
    createIntegrationCredential,
    deleteIntegrationCredential,
    listIntegrations,
    updateIntegrationCredential,
} from "../services/integrations.service";
import type {
    CreateIntegrationCredentialPayload,
    UpdateIntegrationCredentialPayload,
} from "../interfaces/integrations.interface";

export const integrationsQueryKeys = {
    all: ["integrations"] as const,
    list: () => ["integrations", "list"] as const,
};

export function useIntegrations() {
    return useQuery({
        queryKey: integrationsQueryKeys.list(),
        queryFn: () => listIntegrations(),
    });
}

export function useCreateIntegrationCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateIntegrationCredentialPayload) =>
            createIntegrationCredential(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Credential saved", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save credential",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useUpdateIntegrationCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            uuid: string;
            payload: UpdateIntegrationCredentialPayload;
        }) => updateIntegrationCredential(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Credential updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update credential",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useDeleteIntegrationCredential() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteIntegrationCredential(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Credential deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete credential",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}
