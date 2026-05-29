import axios from "axios";
import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateIntegrationKeyPayload,
    IntegrationKey,
    IntegrationProvider,
    IntegrationProviderView,
    UpdateIntegrationKeyPayload,
} from "../interfaces/integrations.interface";

function apiErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (!data?.message) {
        return fallback;
    }
    return Array.isArray(data.message) ? data.message.join(", ") : data.message;
}

export const listIntegrations = async (): Promise<IntegrationProviderView[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.integrations.list);
        return response.data;
    } catch (error) {
        throw new Error(apiErrorMessage(error, "Failed to load integrations."));
    }
};

export const createIntegrationKey = async (
    provider: IntegrationProvider,
    payload: CreateIntegrationKeyPayload,
): Promise<IntegrationKey> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.integrations.createKey(provider),
            payload,
        );
        return response.data;
    } catch (error) {
        throw new Error(apiErrorMessage(error, "Failed to store key."));
    }
};

export const updateIntegrationKey = async (
    uuid: string,
    payload: UpdateIntegrationKeyPayload,
): Promise<IntegrationKey> => {
    try {
        const response = await axiosInstance.patch(
            ApiRoutes.integrations.updateKey(uuid),
            payload,
        );
        return response.data;
    } catch (error) {
        throw new Error(apiErrorMessage(error, "Failed to update key."));
    }
};

export const deleteIntegrationKey = async (
    uuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.integrations.removeKey(uuid),
        );
        return response.data;
    } catch (error) {
        throw new Error(apiErrorMessage(error, "Failed to delete key."));
    }
};
