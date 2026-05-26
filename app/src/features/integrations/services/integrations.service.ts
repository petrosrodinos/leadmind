import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateIntegrationKeyPayload,
    Integration,
    IntegrationKey,
    IntegrationProvider,
    UpdateIntegrationKeyPayload,
} from "../interfaces/integrations.interface";

export const listIntegrations = async (): Promise<Integration[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.integrations.list);
        return response.data;
    } catch {
        throw new Error("Failed to load integrations. Please try again.");
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
    } catch {
        throw new Error("Failed to add key. Please try again.");
    }
};

export const updateIntegrationKey = async (
    keyUuid: string,
    payload: UpdateIntegrationKeyPayload,
): Promise<IntegrationKey> => {
    try {
        const response = await axiosInstance.patch(
            ApiRoutes.integrations.updateKey(keyUuid),
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to update key. Please try again.");
    }
};

export const deleteIntegrationKey = async (
    keyUuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.integrations.removeKey(keyUuid),
        );
        return response.data;
    } catch {
        throw new Error("Failed to delete key. Please try again.");
    }
};
