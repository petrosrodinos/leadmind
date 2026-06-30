import { useSearchParams } from "react-router-dom";
import { Table } from "@heroui/react";
import { BarChart2, Coins, Hash, Layers } from "lucide-react";
import { useApifyUsage } from "@/features/apify-usage/hooks/use-apify-usage";
import { useApifyUsageSummary } from "@/features/apify-usage/hooks/use-apify-usage-summary";
import type {
    ApifyUsageOperation,
    ApifyUsageStatus,
} from "@/features/apify-usage/interfaces/apify-usage.interface";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePermission } from "@/hooks/use-permission";
import {
    APIFY_ACTOR_FILTER_OPTIONS,
    APIFY_ACTOR_LABELS,
    APIFY_USAGE_OPERATION_LABELS,
} from "../constants/apify-usage-labels.constants";
import { USAGE_PAGE_LIMIT } from "../constants/usage-tabs.constants";
import {
    formatUsageCost,
    formatUsageCount,
    formatUsageDate,
    formatUsageDuration,
} from "../utils/usage-format.utils";
import { UsageFilterSelect } from "./usage-filter-select";
import { UsageStatusChip, USAGE_STATUS_FILTER_OPTIONS } from "./usage-status-chip";
import { UsageSummaryCard } from "./usage-summary-card";
import { UsageTableEmpty, UsageTableSkeleton } from "./usage-table-states";

const APIFY_PAGE_PARAM = "apify_page";
const APIFY_OPERATION_PARAM = "apify_operation";
const APIFY_STATUS_PARAM = "apify_status";
const APIFY_ACTOR_PARAM = "apify_actor";

function formatActorLabel(actorId: string): string {
    return APIFY_ACTOR_LABELS[actorId] ?? actorId;
}

export function ApifyUsagePanel() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isAdmin = usePermission("admin_nav");

    const page = Number(searchParams.get(APIFY_PAGE_PARAM) ?? 1);
    const actorFilter = isAdmin ? searchParams.get(APIFY_ACTOR_PARAM) || undefined : undefined;
    const operationFilter = isAdmin
        ? (searchParams.get(APIFY_OPERATION_PARAM) as ApifyUsageOperation) || undefined
        : undefined;
    const statusFilter = isAdmin
        ? (searchParams.get(APIFY_STATUS_PARAM) as ApifyUsageStatus) || undefined
        : undefined;

    const listQuery = {
        page,
        limit: USAGE_PAGE_LIMIT,
        actor_id: actorFilter,
        operation: operationFilter,
        status: statusFilter,
    };

    const { data, isLoading } = useApifyUsage(listQuery);
    const { data: summary, isLoading: summaryLoading } = useApifyUsageSummary({});

    const setParam = (key: string, value: string) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (value) next.set(key, value);
                else next.delete(key);
                next.delete(APIFY_PAGE_PARAM);
                return next;
            },
            { replace: true },
        );
    };

    const setPage = (p: number) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set(APIFY_PAGE_PARAM, String(p));
                return next;
            },
            { replace: true },
        );
    };

    const totalPages = data?.pagination.total_pages ?? 0;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted">
                    Actor runs and scrape history billed through your Apify integration.
                </p>

                {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <UsageFilterSelect
                            label="All actors"
                            value={actorFilter ?? ""}
                            options={APIFY_ACTOR_FILTER_OPTIONS}
                            onChange={(v) => setParam(APIFY_ACTOR_PARAM, v)}
                        />
                        <UsageFilterSelect
                            label="All operations"
                            value={operationFilter ?? ""}
                            options={Object.entries(APIFY_USAGE_OPERATION_LABELS).map(([key, label]) => ({
                                key,
                                label,
                            }))}
                            onChange={(v) => setParam(APIFY_OPERATION_PARAM, v)}
                        />
                        <UsageFilterSelect
                            label="All statuses"
                            value={statusFilter ?? ""}
                            options={USAGE_STATUS_FILTER_OPTIONS}
                            onChange={(v) => setParam(APIFY_STATUS_PARAM, v)}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <UsageSummaryCard
                    label="Total spend"
                    value={summaryLoading ? "…" : formatUsageCost(summary?.total_cost_usd ?? 0)}
                    icon={Coins}
                />
                <UsageSummaryCard
                    label="Requests"
                    value={summaryLoading ? "…" : formatUsageCount(summary?.total_requests ?? 0)}
                    icon={Hash}
                />
                <UsageSummaryCard
                    label="Results"
                    value={summaryLoading ? "…" : formatUsageCount(summary?.total_result_count ?? 0)}
                    icon={Layers}
                />
                <UsageSummaryCard
                    label="Failed"
                    value={summaryLoading ? "…" : formatUsageCount(summary?.failed_requests ?? 0)}
                    icon={BarChart2}
                />
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Apify usage logs" className="min-w-[960px]">
                            <Table.Header>
                                <Table.Column id="date" isRowHeader>
                                    Date
                                </Table.Column>
                                <Table.Column id="operation">Operation</Table.Column>
                                <Table.Column id="actor">Actor</Table.Column>
                                <Table.Column id="results">Results</Table.Column>
                                <Table.Column id="duration">Duration</Table.Column>
                                <Table.Column id="status">Status</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() =>
                                    isLoading ? null : (
                                        <UsageTableEmpty message="No Apify usage logs yet." />
                                    )
                                }
                            >
                                {isLoading ? (
                                    <UsageTableSkeleton columns={6} />
                                ) : (
                                    (data?.data ?? []).map((row) => (
                                        <Table.Row key={row.uuid} id={row.uuid}>
                                            <Table.Cell className="text-xs text-muted whitespace-nowrap">
                                                {formatUsageDate(row.created_at)}
                                            </Table.Cell>
                                            <Table.Cell className="text-xs">
                                                {APIFY_USAGE_OPERATION_LABELS[row.operation] ??
                                                    row.operation}
                                            </Table.Cell>
                                            <Table.Cell className="text-xs max-w-[200px]">
                                                <span className="truncate block" title={row.actor_id}>
                                                    {formatActorLabel(row.actor_id)}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="text-xs tabular-nums">
                                                {formatUsageCount(row.result_count)}
                                            </Table.Cell>
                                            <Table.Cell className="text-xs tabular-nums">
                                                {formatUsageDuration(row.duration_ms)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <UsageStatusChip status={row.status} />
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                {totalPages > 1 && (
                    <div className="border-t border-border px-3 py-2">
                        <TablePagination
                            page={page}
                            totalPages={totalPages}
                            total={data?.pagination.total ?? 0}
                            pageSize={USAGE_PAGE_LIMIT}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
