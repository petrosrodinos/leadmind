import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import type {
    DashboardPendingDraftGroup,
    DashboardStats,
} from "../interfaces/dashboard.interface";

function unwrapContactList(payload: unknown): Contact[] {
    let value: unknown = payload;

    if (typeof value === "string") {
        try {
            value = JSON.parse(value);
        } catch {
            return [];
        }
    }

    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        for (const key of ["data", "contacts", "items", "hits", "results"]) {
            const nested = record[key];
            if (Array.isArray(nested)) return nested as Contact[];
        }
    }

    return [];
}

export { unwrapContactList };

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.dashboard.stats);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to load dashboard stats.",
        );
    }
};

export const getDashboardTopContacts = async (
    limit = 5,
): Promise<Contact[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.dashboard.top_contacts, {
            params: { limit },
        });
        return unwrapContactList(response.data);
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to load top contacts.",
        );
    }
};

export const getDashboardPendingDrafts = async (
    limit = 5,
): Promise<DashboardPendingDraftGroup[]> => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.dashboard.pending_drafts,
            { params: { limit } },
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to load pending drafts.",
        );
    }
};
