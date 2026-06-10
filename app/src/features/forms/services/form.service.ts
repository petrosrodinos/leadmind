import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateFormPayload,
    Form,
    ListFormsQuery,
    PaginatedForms,
    UpdateFormPayload,
} from "../interfaces/form.interface";

export const listForms = async (query: ListFormsQuery = {}): Promise<PaginatedForms> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.forms.list, { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load forms.");
    }
};

export const getForm = async (uuid: string): Promise<Form> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.forms.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load form.");
    }
};

export const createForm = async (payload: CreateFormPayload): Promise<Form> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.forms.create, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create form.");
    }
};

export const updateForm = async (uuid: string, payload: UpdateFormPayload): Promise<Form> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.forms.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update form.");
    }
};

export const deleteForm = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.forms.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete form.");
    }
};

export const duplicateForm = async (uuid: string): Promise<Form> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.forms.duplicate(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to duplicate form.");
    }
};
