import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { buildContactListApiParams } from "@/lib/contact-filter-params";
import type {
    ContactAudienceStats,
    ContactAudienceStatsQuery,
} from "../interfaces/contact-audience-stats.interface";

function buildStatsParams(query?: ContactAudienceStatsQuery): Record<string, string | number | undefined> | undefined {
    if (!query) return undefined;
    return buildContactListApiParams(query);
}

export const getFilterAudienceStats = async (
    uuid: string,
    query?: ContactAudienceStatsQuery,
): Promise<ContactAudienceStats> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.filters.stats(uuid), {
            params: buildStatsParams(query),
        });
        return response.data;
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(message || "Failed to fetch filter analytics.");
    }
};

export const getListAudienceStats = async (
    uuid: string,
    query?: ContactAudienceStatsQuery,
): Promise<ContactAudienceStats> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contact_lists.stats(uuid), {
            params: buildStatsParams(query),
        });
        return response.data;
    } catch (error: unknown) {
        const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        throw new Error(message || "Failed to fetch list analytics.");
    }
};
