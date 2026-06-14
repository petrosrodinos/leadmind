import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    BulkCreateMessagePayload,
    BulkCreateMessageResult,
    CreateMessagePayload,
    OutreachMessage,
    UpdateMessagePayload,
} from "@/features/contacts/interfaces/contact.interface";

export const updateOutreachMessage = async (
    uuid: string,
    payload: UpdateMessagePayload,
): Promise<OutreachMessage> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.outreach.update_message(uuid), payload);
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 409) {
            throw new Error("Only pending messages can be edited.");
        }
        throw new Error(error?.response?.data?.message || "Failed to save message.");
    }
};

export const createDraftMessage = async (
    payload: CreateMessagePayload,
): Promise<OutreachMessage> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.outreach.create_draft, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to save draft.");
    }
};

export const createAndSendMessage = async (
    payload: CreateMessagePayload,
): Promise<OutreachMessage> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.outreach.create_and_send, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to send message.");
    }
};

export const createBulkDraftMessages = async (
    payload: BulkCreateMessagePayload,
): Promise<BulkCreateMessageResult> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.outreach.create_bulk_draft, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to save drafts.");
    }
};

export const createBulkAndSendMessages = async (
    payload: BulkCreateMessagePayload,
): Promise<BulkCreateMessageResult> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.outreach.create_bulk_and_send, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to send messages.");
    }
};

export const sendOutreachMessage = async (uuid: string): Promise<OutreachMessage> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.outreach.send_message(uuid));
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 409) {
            throw new Error("Only pending or failed messages can be sent.");
        }
        throw new Error(error?.response?.data?.message || "Failed to send message.");
    }
};

export const deleteOutreachMessage = async (uuid: string): Promise<{ deleted: true }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.outreach.delete_message(uuid));
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 409) {
            throw new Error("Only pending messages can be deleted.");
        }
        throw new Error(error?.response?.data?.message || "Failed to delete message.");
    }
};
