import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { Lead, ListLeadsQuery, PaginatedLeads } from "../interfaces/lead.interface";

export const listLeads = async (query: ListLeadsQuery = {}): Promise<PaginatedLeads> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.leads.list, { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load leads.");
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

export const enrichLead = async (uuid: string): Promise<{ jobId: string }> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.leads.enrich(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue enrichment.");
    }
};
