import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { Timezone } from "@/interfaces/address/address.interface";

export const getTimezone = async (lat: number, lng: number): Promise<Timezone> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.google_maps.timezone, { params: { lat, lng } });
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch timezone. Please try again.");
    }
};
