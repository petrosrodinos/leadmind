import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateFormFieldPayload,
    FormField,
    ReorderFormFieldsPayload,
    UpdateFormFieldPayload,
} from "../interfaces/form.interface";

export const createFormField = async (
    formUuid: string,
    payload: CreateFormFieldPayload,
): Promise<FormField> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.forms.createField(formUuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create field.");
    }
};

export const updateFormField = async (
    formUuid: string,
    fieldUuid: string,
    payload: UpdateFormFieldPayload,
): Promise<FormField> => {
    try {
        const response = await axiosInstance.put(
            ApiRoutes.forms.updateField(formUuid, fieldUuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update field.");
    }
};

export const deleteFormField = async (
    formUuid: string,
    fieldUuid: string,
): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.forms.removeField(formUuid, fieldUuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete field.");
    }
};

export const reorderFormFields = async (
    formUuid: string,
    payload: ReorderFormFieldsPayload,
): Promise<FormField[]> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.forms.reorderFields(formUuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to reorder fields.");
    }
};
