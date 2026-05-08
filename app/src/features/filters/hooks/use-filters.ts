import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createFilter,
    deleteFilter,
    getFilter,
    listFilterJobs,
    listFilters,
    runFilter,
    updateFilter,
} from "../services/filters.service";
import { JobStatus } from "../interfaces/filter.interface";
import type {
    CreateFilterPayload,
    ListFilterJobsQuery,
    PaginatedFilterJobs,
    UpdateFilterPayload,
} from "../interfaces/filter.interface";
import { toast } from "@/hooks/use-toast";

export const filtersQueryKeys = {
    all: ["filters"] as const,
    list: () => ["filters", "list"] as const,
    detail: (uuid: string) => ["filters", "detail", uuid] as const,
    jobs: (uuid: string, query: ListFilterJobsQuery) =>
        ["filters", uuid, "jobs", query] as const,
    jobsRoot: (uuid: string) => ["filters", uuid, "jobs"] as const,
};

export function useFilters() {
    return useQuery({
        queryKey: filtersQueryKeys.list(),
        queryFn: listFilters,
    });
}

export function useFilter(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? filtersQueryKeys.detail(uuid) : ["filters", "detail", "none"],
        queryFn: () => getFilter(uuid as string),
        enabled: !!uuid,
    });
}

export function useFilterJobs(uuid: string | null | undefined, query: ListFilterJobsQuery) {
    return useQuery({
        queryKey: uuid ? filtersQueryKeys.jobs(uuid, query) : ["filters", "none", "jobs", query],
        queryFn: () => listFilterJobs(uuid as string, query),
        enabled: !!uuid,
        placeholderData: (prev) => prev,
        refetchInterval: (q) => {
            const data = q.state.data as PaginatedFilterJobs | undefined;
            if (!data) return false;
            const anyRunning = data.items.some(
                (j) => j.status === JobStatus.RUNNING || j.status === JobStatus.PENDING,
            );
            return anyRunning ? 5_000 : false;
        },
    });
}

export function useCreateFilter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFilterPayload) => createFilter(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: filtersQueryKeys.all });
            toast({ title: "Filter created", duration: 2000 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create filter",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateFilter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateFilterPayload }) =>
            updateFilter(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: filtersQueryKeys.all });
            qc.invalidateQueries({ queryKey: filtersQueryKeys.detail(vars.uuid) });
            toast({ title: "Filter saved", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save filter",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteFilter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteFilter(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: filtersQueryKeys.all });
            toast({ title: "Filter deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete filter",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRunFilter() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => runFilter(uuid),
        onSuccess: (_data, uuid) => {
            // Refresh the jobs query immediately so the "last run" line updates.
            qc.invalidateQueries({ queryKey: filtersQueryKeys.jobsRoot(uuid) });
            // The worker creates the FilterJob row a moment after the run is
            // enqueued — re-invalidate a few times to catch the RUNNING row,
            // after which the 5s polling in useFilterJobs takes over.
            [1500, 4000, 8000].forEach((ms) => {
                setTimeout(() => {
                    qc.invalidateQueries({ queryKey: filtersQueryKeys.jobsRoot(uuid) });
                }, ms);
            });
            toast({
                title: "Run queued",
                description: "The scrape job is now in the queue.",
                duration: 2000,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not run filter",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

/**
 * Convenience: returns whether the latest job for a filter is active
 * (RUNNING or PENDING). Backed by the same react-query cache as the
 * cards/jobs page so it dedupes automatically.
 */
export function useLatestFilterJob(uuid: string | null | undefined) {
    const query = useFilterJobs(uuid, { page: 1, limit: 1 });
    const lastJob = query.data?.items[0];
    const isActive =
        lastJob?.status === JobStatus.RUNNING || lastJob?.status === JobStatus.PENDING;
    return { lastJob, isActive, query };
}
