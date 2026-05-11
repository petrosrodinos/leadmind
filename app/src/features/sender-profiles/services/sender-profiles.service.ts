import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateSenderProfilePayload,
    SenderProfile,
    UpdateSenderProfilePayload,
} from "../interfaces/sender-profile.interface";

export const listSenderProfiles = async (): Promise<SenderProfile[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.sender_profiles.list);
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to load sender profiles.",
        );
    }
};

export const getSenderProfile = async (uuid: string): Promise<SenderProfile> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.sender_profiles.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to load sender profile.",
        );
    }
};

export const createSenderProfile = async (
    payload: CreateSenderProfilePayload,
): Promise<SenderProfile> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.sender_profiles.create,
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to create sender profile.",
        );
    }
};

export const updateSenderProfile = async (
    uuid: string,
    payload: UpdateSenderProfilePayload,
): Promise<SenderProfile> => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.sender_profiles.update(uuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to update sender profile.",
        );
    }
};

export const deleteSenderProfile = async (
    uuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.sender_profiles.remove(uuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message || "Failed to delete sender profile.",
        );
    }
};
