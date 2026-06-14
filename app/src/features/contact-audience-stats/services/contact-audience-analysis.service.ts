import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { ContactAudienceScope } from "../interfaces/contact-audience-stats.interface";
import type {
    ContactAudienceAnalysis,
    ListContactAudienceAnalysesQuery,
    PaginatedContactAudienceAnalyses,
} from "../interfaces/contact-audience-analysis.interface";

function analysesRoute(scope: ContactAudienceScope): string {
    return scope.type === "filter"
        ? ApiRoutes.filters.analyses(scope.uuid)
        : ApiRoutes.contact_lists.analyses(scope.uuid);
}

function analysisRoute(scope: ContactAudienceScope, analysisUuid: string): string {
    return scope.type === "filter"
        ? ApiRoutes.filters.analysis(scope.uuid, analysisUuid)
        : ApiRoutes.contact_lists.analysis(scope.uuid, analysisUuid);
}

export const listAudienceAnalyses = async (
    scope: ContactAudienceScope,
    query?: ListContactAudienceAnalysesQuery,
): Promise<PaginatedContactAudienceAnalyses> => {
    try {
        const response = await axiosInstance.get(analysesRoute(scope), { params: query });
        return response.data;
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(message || "Failed to fetch audience analyses.");
    }
};

export const createAudienceAnalysis = async (
    scope: ContactAudienceScope,
): Promise<ContactAudienceAnalysis> => {
    try {
        const response = await axiosInstance.post(analysesRoute(scope));
        return response.data;
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(message || "Failed to run audience analysis.");
    }
};

export const deleteAudienceAnalysis = async (
    scope: ContactAudienceScope,
    analysisUuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(analysisRoute(scope, analysisUuid));
        return response.data;
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(message || "Failed to delete audience analysis.");
    }
};
