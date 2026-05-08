import { useQuery } from "@tanstack/react-query";
import {
    getDashboardPendingDrafts,
    getDashboardStats,
    getDashboardTopContacts,
} from "../services/dashboard.service";

export const dashboardQueryKeys = {
    stats: ["dashboard", "stats"] as const,
    topContacts: (limit: number) => ["dashboard", "top-contacts", limit] as const,
    pendingDrafts: (limit: number) =>
        ["dashboard", "pending-drafts", limit] as const,
};

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardQueryKeys.stats,
        queryFn: getDashboardStats,
    });
}

export function useDashboardTopContacts(limit = 5) {
    return useQuery({
        queryKey: dashboardQueryKeys.topContacts(limit),
        queryFn: () => getDashboardTopContacts(limit),
    });
}

export function useDashboardPendingDrafts(limit = 5) {
    return useQuery({
        queryKey: dashboardQueryKeys.pendingDrafts(limit),
        queryFn: () => getDashboardPendingDrafts(limit),
    });
}
