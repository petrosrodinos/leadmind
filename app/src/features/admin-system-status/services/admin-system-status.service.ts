import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { SystemStatusResponse } from "../interfaces/system-status.interface";

export const getSystemStatus = async (): Promise<SystemStatusResponse> => {
    const response = await axiosInstance.get<SystemStatusResponse>(ApiRoutes.admin.system_status);
    return response.data;
};
