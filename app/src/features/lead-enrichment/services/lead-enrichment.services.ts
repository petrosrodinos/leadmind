import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import type {
    BulkEnrichLeadsResponse,
    EnrichLeadResponse,
    ListLeadEnrichmentsQuery,
    PaginatedLeadEnrichments,
} from "../interfaces/lead-enrichment.interfaces";

export const listLeadEnrichments = async (
    uuid: string,
    query: ListLeadEnrichmentsQuery = {},
): Promise<PaginatedLeadEnrichments> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.leads.enrichments(uuid), { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load enrichments.");
    }
};

export const enrichLead = async (
    uuid: string,
    payload: { sources?: EnrichmentSource[]; use_batch?: boolean } = {},
): Promise<EnrichLeadResponse> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.leads.enrich(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue enrichment.");
    }
};

export const enrichLeadsBulk = async (payload: {
    uuids: string[];
    sources?: EnrichmentSource[];
    use_batch?: boolean;
}): Promise<BulkEnrichLeadsResponse> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.leads.bulk_enrich, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue bulk enrichment.");
    }
};
