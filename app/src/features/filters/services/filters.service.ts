import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateFilterPayload,
    Filter,
    ListFilterJobsQuery,
    ManualRunResponse,
    PaginatedFilterJobs,
    UpdateFilterPayload,
} from "../interfaces/filter.interface";

export const listFilters = async (): Promise<Filter[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.filters.list);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load filters.");
    }
};

export const getFilter = async (uuid: string): Promise<Filter> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.filters.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load filter.");
    }
};

export const createFilter = async (payload: CreateFilterPayload): Promise<Filter> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.filters.create, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create filter.");
    }
};

export const updateFilter = async (
    uuid: string,
    payload: UpdateFilterPayload,
): Promise<Filter> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.filters.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update filter.");
    }
};

export const deleteFilter = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.filters.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete filter.");
    }
};

export const runFilter = async (uuid: string): Promise<ManualRunResponse> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.filters.run(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue run.");
    }
};

export const listFilterJobs = async (
    uuid: string,
    query: ListFilterJobsQuery = {},
): Promise<PaginatedFilterJobs> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.filters.jobs(uuid), {
            params: query,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load filter jobs.");
    }
};
