import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    completeReminder,
    createReminder,
    deleteReminder,
    getReminderStats,
    listReminders,
    updateReminder,
} from "../services/reminder.service";
import type {
    CreateReminderPayload,
    ListRemindersQuery,
    UpdateReminderPayload,
} from "../interfaces/reminder.interface";
import { toast } from "@/hooks/use-toast";

export const reminderQueryKeys = {
    all: ["reminders"] as const,
    list: (query: ListRemindersQuery) => ["reminders", "list", query] as const,
    stats: ["reminders", "stats"] as const,
};

export function useReminders(query: ListRemindersQuery = {}) {
    return useQuery({
        queryKey: reminderQueryKeys.list(query),
        queryFn: () => listReminders(query),
        staleTime: 30_000,
    });
}

export function useReminderStats() {
    return useQuery({
        queryKey: reminderQueryKeys.stats,
        queryFn: getReminderStats,
        staleTime: 60_000,
    });
}

export function useCreateReminder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateReminderPayload) => createReminder(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reminderQueryKeys.all });
            toast({ title: "Reminder created", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create reminder",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateReminder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateReminderPayload }) =>
            updateReminder(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reminderQueryKeys.all });
            toast({ title: "Reminder updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update reminder",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useCompleteReminder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => completeReminder(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reminderQueryKeys.all });
            toast({ title: "Reminder completed", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not complete reminder",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteReminder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteReminder(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reminderQueryKeys.all });
            toast({ title: "Reminder deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete reminder",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
