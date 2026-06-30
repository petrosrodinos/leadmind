import { useQuery } from "@tanstack/react-query";
import { getSystemStatus } from "../services/admin-system-status.service";

export const systemStatusQueryKeys = {
    all: ["admin-system-status"] as const,
};

export function useAdminSystemStatus() {
    return useQuery({
        queryKey: systemStatusQueryKeys.all,
        queryFn: getSystemStatus,
        refetchInterval: 30_000,
    });
}
