import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateReminderPayload,
    ListRemindersQuery,
    PaginatedReminders,
    Reminder,
    ReminderStats,
    UpdateReminderPayload,
} from "../interfaces/reminder.interface";

export const listReminders = async (query: ListRemindersQuery = {}): Promise<PaginatedReminders> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.reminders.list, { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load reminders.");
    }
};

export const getReminderStats = async (): Promise<ReminderStats> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.reminders.stats);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load reminder stats.");
    }
};

export const getReminder = async (uuid: string): Promise<Reminder> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.reminders.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load reminder.");
    }
};

export const createReminder = async (payload: CreateReminderPayload): Promise<Reminder> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.reminders.create, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create reminder.");
    }
};

export const updateReminder = async (
    uuid: string,
    payload: UpdateReminderPayload,
): Promise<Reminder> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.reminders.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update reminder.");
    }
};

export const completeReminder = async (uuid: string): Promise<Reminder> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.reminders.complete(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to complete reminder.");
    }
};

export const deleteReminder = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.reminders.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete reminder.");
    }
};
