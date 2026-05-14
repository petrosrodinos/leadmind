import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createScoringInstruction,
    deleteScoringInstruction,
    listScoringInstructions,
    updateScoringInstruction,
} from "../services/scoring-instructions.service";
import type {
    CreateScoringInstructionPayload,
    UpdateScoringInstructionPayload,
} from "../interfaces/scoring-instruction.interface";
import { toast } from "@/hooks/use-toast";

export const scoringInstructionsQueryKeys = {
    all: ["scoring-instructions"] as const,
    list: () => ["scoring-instructions", "list"] as const,
};

export function useScoringInstructions() {
    return useQuery({
        queryKey: scoringInstructionsQueryKeys.list(),
        queryFn: listScoringInstructions,
        staleTime: 30_000,
    });
}

export function useCreateScoringInstruction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateScoringInstructionPayload) => createScoringInstruction(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: scoringInstructionsQueryKeys.all });
            toast({ title: "Scoring instruction created", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useUpdateScoringInstruction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateScoringInstructionPayload }) =>
            updateScoringInstruction(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: scoringInstructionsQueryKeys.all });
            toast({ title: "Saved", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}

export function useDeleteScoringInstruction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteScoringInstruction(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: scoringInstructionsQueryKeys.all });
            toast({ title: "Deleted", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete",
                description: error.message,
                variant: "error",
                duration: 3000,
            });
        },
    });
}
