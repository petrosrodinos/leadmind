import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    ContactCompletionSummary,
    CreateCompletionPayload,
    FormCompletion,
    ListCompletionsQuery,
    PaginatedCompletions,
    UpdateCompletionPayload,
} from "../interfaces/form-completion.interface";

export const listFormCompletions = async (
    formUuid: string,
    query: ListCompletionsQuery = {},
): Promise<PaginatedCompletions> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.forms.listCompletions(formUuid), {
            params: query,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load completions.");
    }
};

export const getFormCompletion = async (
    formUuid: string,
    completionUuid: string,
): Promise<FormCompletion> => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.forms.getCompletion(formUuid, completionUuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load completion.");
    }
};

export const createFormCompletion = async (
    formUuid: string,
    payload: CreateCompletionPayload,
): Promise<FormCompletion> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.forms.createCompletion(formUuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create completion.");
    }
};

export const updateFormCompletion = async (
    formUuid: string,
    completionUuid: string,
    payload: UpdateCompletionPayload,
): Promise<FormCompletion> => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.forms.updateCompletion(formUuid, completionUuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update completion.");
    }
};

export const deleteFormCompletion = async (
    formUuid: string,
    completionUuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.forms.removeCompletion(formUuid, completionUuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete completion.");
    }
};

export const getContactCompletions = async (
    contactUuid: string,
): Promise<ContactCompletionSummary[]> => {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.forms.contactCompletions(contactUuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load contact completions.");
    }
};
