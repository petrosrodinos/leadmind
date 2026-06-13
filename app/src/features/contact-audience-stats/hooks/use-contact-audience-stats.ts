import { useQuery } from "@tanstack/react-query";
import type {
    ContactAudienceScope,
    ContactAudienceStatsQuery,
} from "../interfaces/contact-audience-stats.interface";
import { getFilterAudienceStats, getListAudienceStats } from "../services/contact-audience-stats.service";

export const useContactAudienceStats = (
    scope: ContactAudienceScope | undefined,
    query?: ContactAudienceStatsQuery,
) => {
    const uuid = scope?.uuid ?? "";
    const scopeType = scope?.type;

    return useQuery({
        queryKey: ["contact-audience-stats", scopeType, uuid, query],
        queryFn: () => {
            if (!scope) throw new Error("Missing scope");
            return scope.type === "filter"
                ? getFilterAudienceStats(scope.uuid, query)
                : getListAudienceStats(scope.uuid, query);
        },
        enabled: !!uuid && !!scopeType,
    });
};
