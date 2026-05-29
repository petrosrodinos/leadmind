import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateIntegrationCredentialPayload,
    IntegrationCredential,
    IntegrationProviderView,
    UpdateIntegrationCredentialPayload,
} from "../interfaces/integrations.interface";

export const listIntegrations = async (): Promise<IntegrationProviderView[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.integrations.list);
        return response.data;
    } catch {
        throw new Error("Failed to load integrations. Please try again.");
    }
};

export const createIntegrationCredential = async (
    payload: CreateIntegrationCredentialPayload,
): Promise<IntegrationCredential> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.integrations.createCredential,
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to store credential. Please try again.");
    }
};

export const updateIntegrationCredential = async (
    uuid: string,
    payload: UpdateIntegrationCredentialPayload,
): Promise<IntegrationCredential> => {
    try {
        const response = await axiosInstance.patch(
            ApiRoutes.integrations.updateCredential(uuid),
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to update credential. Please try again.");
    }
};

export const deleteIntegrationCredential = async (
    uuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.integrations.removeCredential(uuid),
        );
        return response.data;
    } catch {
        throw new Error("Failed to delete credential. Please try again.");
    }
};
