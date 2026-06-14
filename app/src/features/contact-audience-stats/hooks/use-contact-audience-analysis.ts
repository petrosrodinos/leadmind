import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { ContactAudienceScope } from "../interfaces/contact-audience-stats.interface";
import type { ListContactAudienceAnalysesQuery } from "../interfaces/contact-audience-analysis.interface";
import {
    createAudienceAnalysis,
    deleteAudienceAnalysis,
    listAudienceAnalyses,
} from "../services/contact-audience-analysis.service";

export const useContactAudienceAnalyses = (
    scope: ContactAudienceScope | undefined,
    query?: ListContactAudienceAnalysesQuery,
) => {
    const uuid = scope?.uuid ?? "";
    const scopeType = scope?.type;

    return useQuery({
        queryKey: ["contact-audience-analyses", scopeType, uuid, query?.page ?? 1, query?.limit ?? 10],
        queryFn: () => {
            if (!scope) throw new Error("Missing scope");
            return listAudienceAnalyses(scope, query);
        },
        enabled: !!uuid && !!scopeType,
    });
};

export const useCreateContactAudienceAnalysis = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (scope: ContactAudienceScope) => createAudienceAnalysis(scope),
        onSuccess: (_data, scope) => {
            queryClient.invalidateQueries({
                queryKey: ["contact-audience-analyses", scope.type, scope.uuid],
            });
        },
    });
};

export const useDeleteContactAudienceAnalysis = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (vars: { scope: ContactAudienceScope; analysisUuid: string }) =>
            deleteAudienceAnalysis(vars.scope, vars.analysisUuid),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({
                queryKey: ["contact-audience-analyses", vars.scope.type, vars.scope.uuid],
            });
            toast({ title: "Analysis deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete analysis",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
};
