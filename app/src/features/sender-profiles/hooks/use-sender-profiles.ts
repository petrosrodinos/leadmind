import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
    createSenderProfile,
    deleteSenderProfile,
    getSenderProfile,
    listSenderProfiles,
    updateSenderProfile,
} from "../services/sender-profiles.service";
import type {
    CreateSenderProfilePayload,
    UpdateSenderProfilePayload,
} from "../interfaces/sender-profile.interface";

export const senderProfilesQueryKeys = {
    all: ["sender-profiles"] as const,
    list: () => ["sender-profiles", "list"] as const,
    detail: (uuid: string) => ["sender-profiles", "detail", uuid] as const,
};

export function useSenderProfiles() {
    return useQuery({
        queryKey: senderProfilesQueryKeys.list(),
        queryFn: () => listSenderProfiles(),
    });
}

export function useSenderProfile(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid
            ? senderProfilesQueryKeys.detail(uuid)
            : ["sender-profiles", "detail", "none"],
        queryFn: () => getSenderProfile(uuid as string),
        enabled: !!uuid,
    });
}

export function useCreateSenderProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSenderProfilePayload) =>
            createSenderProfile(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: senderProfilesQueryKeys.all });
            toast({ title: "Sender profile created", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create sender profile",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateSenderProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateSenderProfilePayload }) =>
            updateSenderProfile(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: senderProfilesQueryKeys.all });
            toast({ title: "Sender profile updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update sender profile",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteSenderProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteSenderProfile(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: senderProfilesQueryKeys.all });
            toast({ title: "Sender profile deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete sender profile",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
