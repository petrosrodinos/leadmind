import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
    createIntegrationKey,
    deleteIntegrationKey,
    listIntegrations,
    updateIntegrationKey,
} from "../services/integrations.service";
import type {
    CreateIntegrationKeyPayload,
    IntegrationProvider,
    UpdateIntegrationKeyPayload,
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

export function useCreateIntegrationKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            provider: IntegrationProvider;
            payload: CreateIntegrationKeyPayload;
        }) => createIntegrationKey(vars.provider, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Key added", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not add key",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useUpdateIntegrationKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            keyUuid: string;
            payload: UpdateIntegrationKeyPayload;
        }) => updateIntegrationKey(vars.keyUuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Key updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update key",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useDeleteIntegrationKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (keyUuid: string) => deleteIntegrationKey(keyUuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Key deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete key",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}
