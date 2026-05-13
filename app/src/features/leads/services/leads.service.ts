import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { Lead, ListLeadsQuery, PaginatedLeads, UpdateLeadPayload } from "../interfaces/lead.interface";

export const listLeads = async (query: ListLeadsQuery = {}): Promise<PaginatedLeads> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.leads.list, { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load leads.");
    }
};

export const updateLead = async (uuid: string, payload: UpdateLeadPayload): Promise<Lead> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.leads.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update lead.");
    }
};

export const deleteLead = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.leads.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete lead.");
    }
};

export const getLead = async (uuid: string): Promise<Lead> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.leads.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load lead.");
    }
};
