import { useSearchParams } from "react-router-dom";
import { Table } from "@heroui/react";
import { BarChart2, Coins, Hash } from "lucide-react";
import { useAiUsage } from "@/features/ai-usage/hooks/use-ai-usage";
import { useAiUsageSummary } from "@/features/ai-usage/hooks/use-ai-usage-summary";
import type { AiUsageOperation, AiUsageStatus } from "@/features/ai-usage/interfaces/ai-usage.interface";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePermission } from "@/hooks/use-permission";
import {
    AI_USAGE_OPERATION_LABELS,
    AI_USAGE_PROVIDER_OPTIONS,
} from "../constants/ai-usage-labels.constants";
import { USAGE_PAGE_LIMIT } from "../constants/usage-tabs.constants";
import {
    formatUsageCost,
    formatUsageCount,
    formatUsageDate,
} from "../utils/usage-format.utils";
import { UsageFilterSelect } from "./usage-filter-select";
import { UsageStatusChip, USAGE_STATUS_FILTER_OPTIONS } from "./usage-status-chip";
import { UsageSummaryCard } from "./usage-summary-card";
import { UsageTableEmpty, UsageTableSkeleton } from "./usage-table-states";

export function AiUsagePanel() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isAdmin = usePermission("admin_nav");

    const page = Number(searchParams.get("page") ?? 1);
    const providerFilter = isAdmin ? searchParams.get("provider") || undefined : undefined;
    const operationFilter = isAdmin
        ? (searchParams.get("operation") as AiUsageOperation) || undefined
        : undefined;
    const statusFilter = isAdmin ? (searchParams.get("status") as AiUsageStatus) || undefined : undefined;

    const listQuery = {
        page,
        limit: USAGE_PAGE_LIMIT,
        provider: providerFilter,
        operation: operationFilter,
        status: statusFilter,
    };

    const { data, isLoading } = useAiUsage(listQuery);
    const { data: summary, isLoading: summaryLoading } = useAiUsageSummary({});

    const setParam = (key: string, value: string) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (value) next.set(key, value);
                else next.delete(key);
                next.delete("page");
                return next;
            },
            { replace: true },
        );
    };

    const setPage = (p: number) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(p));
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
                    Token and cost history for AI requests on your account.
                </p>

                {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <UsageFilterSelect
                            label="All providers"
                            value={providerFilter ?? ""}
                            options={AI_USAGE_PROVIDER_OPTIONS}
                            onChange={(v) => setParam("provider", v)}
                        />
                        <UsageFilterSelect
                            label="All operations"
                            value={operationFilter ?? ""}
                            options={Object.entries(AI_USAGE_OPERATION_LABELS).map(([key, label]) => ({
                                key,
                                label,
                            }))}
                            onChange={(v) => setParam("operation", v)}
                        />
                        <UsageFilterSelect
                            label="All statuses"
                            value={statusFilter ?? ""}
                            options={USAGE_STATUS_FILTER_OPTIONS}
                            onChange={(v) => setParam("status", v)}
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
                    label="Tokens"
                    value={summaryLoading ? "…" : formatUsageCount(summary?.total_tokens ?? 0)}
                    icon={BarChart2}
                />
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="AI usage logs" className="min-w-[900px]">
                            <Table.Header>
                                <Table.Column id="date" isRowHeader>
                                    Date
                                </Table.Column>
                                <Table.Column id="operation">Operation</Table.Column>
                                <Table.Column id="provider">Provider / model</Table.Column>
                                <Table.Column id="tokens">Tokens</Table.Column>
                                <Table.Column id="cost">Cost</Table.Column>
                                <Table.Column id="status">Status</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() =>
                                    isLoading ? null : <UsageTableEmpty message="No AI usage logs yet." />
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
                                                {AI_USAGE_OPERATION_LABELS[row.operation] ?? row.operation}
                                                {row.request_mode === "BATCH" && (
                                                    <span className="ml-1.5 text-muted">(batch)</span>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell className="text-xs">
                                                <span className="capitalize">{row.provider}</span>
                                                <span className="text-muted"> · {row.model}</span>
                                            </Table.Cell>
                                            <Table.Cell className="text-xs tabular-nums">
                                                {formatUsageCount(row.total_tokens)}
                                            </Table.Cell>
                                            <Table.Cell className="text-xs tabular-nums">
                                                {formatUsageCost(row.total_cost_usd)}
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
