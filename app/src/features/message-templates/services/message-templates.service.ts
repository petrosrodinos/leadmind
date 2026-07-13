import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateMessageTemplatePayload,
    CreateTemplateFromSourcePayload,
    GenerateTemplateMessagePayload,
    GenerateTemplateMessageResult,
    MessageTemplate,
    UpdateMessageTemplatePayload,
} from "../interfaces/message-template.interface";

export const listMessageTemplates = async (): Promise<MessageTemplate[]> => {
    try {
        const response = await axiosInstance.get<MessageTemplate[]>(ApiRoutes.message_templates.list);
        return response.data;
    } catch {
        throw new Error("Failed to load message templates. Please try again.");
    }
};

export const createMessageTemplate = async (
    payload: CreateMessageTemplatePayload,
): Promise<MessageTemplate> => {
    try {
        const response = await axiosInstance.post<MessageTemplate>(
            ApiRoutes.message_templates.create,
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to create message template. Please try again.");
    }
};

export const updateMessageTemplate = async (
    uuid: string,
    payload: UpdateMessageTemplatePayload,
): Promise<MessageTemplate> => {
    try {
        const response = await axiosInstance.put<MessageTemplate>(
            ApiRoutes.message_templates.update(uuid),
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to update message template. Please try again.");
    }
};

export const deleteMessageTemplate = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete<{ uuid: string }>(
            ApiRoutes.message_templates.remove(uuid),
        );
        return response.data;
    } catch {
        throw new Error("Failed to delete message template. Please try again.");
    }
};

export const generateTemplateMessage = async (
    payload: GenerateTemplateMessagePayload,
): Promise<GenerateTemplateMessageResult> => {
    try {
        const response = await axiosInstance.post<GenerateTemplateMessageResult>(
            ApiRoutes.message_templates.ai_generate,
            payload,
        );
        return response.data;
    } catch {
        throw new Error("Failed to generate template content. Please try again.");
    }
};

export const createTemplateFromCampaign = async (
    campaignUuid: string,
    payload?: CreateTemplateFromSourcePayload,
): Promise<MessageTemplate> => {
    try {
        const response = await axiosInstance.post<MessageTemplate>(
            ApiRoutes.message_templates.from_campaign(campaignUuid),
            payload ?? {},
        );
        return response.data;
    } catch {
        throw new Error("Failed to create template from campaign. Please try again.");
    }
};

export const createTemplateFromMessage = async (
    messageUuid: string,
    payload?: CreateTemplateFromSourcePayload,
): Promise<MessageTemplate> => {
    try {
        const response = await axiosInstance.post<MessageTemplate>(
            ApiRoutes.message_templates.from_message(messageUuid),
            payload ?? {},
        );
        return response.data;
    } catch {
        throw new Error("Failed to create template from message. Please try again.");
    }
};
