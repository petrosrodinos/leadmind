import { useQuery } from "@tanstack/react-query";
import { getPrefectures, getLegalTypes, getStatuses } from "../services/gemi.service";

const gemiQueryKeys = {
    prefectures: ["gemi", "prefectures"] as const,
    legalTypes: ["gemi", "legal-types"] as const,
    statuses: ["gemi", "statuses"] as const,
};

export function useGemiPrefectures() {
    return useQuery({
        queryKey: gemiQueryKeys.prefectures,
        queryFn: getPrefectures,
        staleTime: Infinity,
    });
}

export function useGemiLegalTypes() {
    return useQuery({
        queryKey: gemiQueryKeys.legalTypes,
        queryFn: getLegalTypes,
        staleTime: Infinity,
    });
}

export function useGemiStatuses() {
    return useQuery({
        queryKey: gemiQueryKeys.statuses,
        queryFn: getStatuses,
        staleTime: Infinity,
    });
}
