import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";

export interface GemiPrefecture {
    id: string;
    descr: string;
    descrEn?: string;
}

export interface GemiLegalType {
    id: number;
    descr: string;
    descrEn?: string;
}

export interface GemiCompanyStatus {
    id: number;
    descr: string;
    descrEn?: string;
    isActive?: boolean;
}

export const getPrefectures = async (): Promise<GemiPrefecture[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.gemi.prefectures);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load prefectures.");
    }
};

export const getLegalTypes = async (): Promise<GemiLegalType[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.gemi.legal_types);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load legal types.");
    }
};

export const getStatuses = async (): Promise<GemiCompanyStatus[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.gemi.statuses);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load company statuses.");
    }
};
