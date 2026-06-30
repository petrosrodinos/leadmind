import { useSearchParams } from "react-router-dom";
import { Chip, ListBox, Select, Table } from "@heroui/react";
import { BarChart2, CheckCircle2, Coins, Hash, XCircle } from "lucide-react";
import { useAiUsage } from "@/features/ai-usage/hooks/use-ai-usage";
import { useAiUsageSummary } from "@/features/ai-usage/hooks/use-ai-usage-summary";
import type { AiUsageOperation, AiUsageStatus } from "@/features/ai-usage/interfaces/ai-usage.interface";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePermission } from "@/hooks/use-permission";

const PAGE_LIMIT = 20;

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const STATUS_META: Record<AiUsageStatus, { label: string; color: ChipColor; icon: React.ComponentType<{ className?: string }> }> = {
    SUCCESS: { label: "Success", color: "success", icon: CheckCircle2 },
    ERROR: { label: "Error", color: "danger", icon: XCircle },
};

const OPERATION_LABELS: Record<AiUsageOperation, string> = {
    LEAD_ENRICH: "Lead enrich",
    CONTACT_SCORE: "Contact score",
    CONTACT_DRAFT: "Contact draft",
    CAMPAIGN_DRAFT: "Campaign draft",
    ENRICHMENT_SUMMARY: "Enrichment summary",
    AUDIENCE_ANALYSIS: "Audience analysis",
    EMBEDDING: "Embedding",
    ADMIN_GENERATE: "Admin generate",
    BATCH_JOB: "Batch job",
    OTHER: "Other",
};

const PROVIDER_OPTIONS = [
    { key: "openai", label: "OpenAI" },
    { key: "anthropic", label: "Anthropic" },
    { key: "perplexity", label: "Perplexity" },
];

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCost(value: number | null | undefined): string {
    if (value == null) return "—";
    if (value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    return `$${value.toFixed(4)}`;
}

function formatTokens(value: number | null | undefined): string {
    if (value == null) return "—";
    return value.toLocaleString();
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
}) {
    return (
        <Select
            aria-label={label}
            placeholder={label}
            value={value || null}
            onChange={(v) => onChange(v != null ? String(v) : "")}
        >
            <Select.Trigger className="min-w-36 h-8 text-xs">
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    <ListBox.Item key="" id="" textValue={label}>
                        {label}
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                    {options.map((o) => (
                        <ListBox.Item key={o.key} id={o.key} textValue={o.label}>
                            {o.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 min-w-[140px]">
            <div className="flex items-center gap-2 text-muted mb-1">
                <Icon className="size-3.5 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
        </div>
    );
}

function StatusChip({ status }: { status: AiUsageStatus }) {
    const { label, color, icon: Icon } = STATUS_META[status];
    return (
        <Chip size="sm" variant="soft" color={color}>
            <Icon className="size-3" />
            <Chip.Label>{label}</Chip.Label>
        </Chip>
    );
}

export default function SettingsUsagePage() {
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
        limit: PAGE_LIMIT,
        provider: providerFilter,
        operation: operationFilter,
        status: statusFilter,
    };

    const { data, isLoading } = useAiUsage(listQuery);
    const { data: summary, isLoading: summaryLoading } = useAiUsageSummary({});

    const setParam = (key: string, value: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value);
            else next.delete(key);
            next.delete("page");
            return next;
        }, { replace: true });
    };

    const setPage = (p: number) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
        }, { replace: true });
    };

    const totalPages = data?.pagination.total_pages ?? 0;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <BarChart2 className="size-5 text-muted shrink-0" />
                    <div>
                        <h1 className="text-lg font-semibold text-foreground leading-tight">AI Usage</h1>
                        <p className="text-xs text-muted mt-0.5">
                            Token and cost history for your account
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterSelect
                            label="All providers"
                            value={providerFilter ?? ""}
                            options={PROVIDER_OPTIONS}
                            onChange={(v) => setParam("provider", v)}
                        />
                        <FilterSelect
                            label="All operations"
                            value={operationFilter ?? ""}
                            options={Object.entries(OPERATION_LABELS).map(([key, label]) => ({ key, label }))}
                            onChange={(v) => setParam("operation", v)}
                        />
                        <FilterSelect
                            label="All statuses"
                            value={statusFilter ?? ""}
                            options={Object.keys(STATUS_META).map((s) => ({
                                key: s,
                                label: STATUS_META[s as AiUsageStatus].label,
                            }))}
                            onChange={(v) => setParam("status", v)}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                <SummaryCard
                    label="Total spend"
                    value={summaryLoading ? "…" : formatCost(summary?.total_cost_usd ?? 0)}
                    icon={Coins}
                />
                <SummaryCard
                    label="Requests"
                    value={summaryLoading ? "…" : (summary?.total_requests ?? 0).toLocaleString()}
                    icon={Hash}
                />
                <SummaryCard
                    label="Tokens"
                    value={summaryLoading ? "…" : (summary?.total_tokens ?? 0).toLocaleString()}
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
                                    isLoading ? null : (
                                        <div className="flex items-center justify-center py-12 text-center text-sm text-muted">
                                            No usage logs yet.
                                        </div>
                                    )
                                }
                            >
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                          <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                                              {Array.from({ length: 6 }).map((__, j) => (
                                                  <Table.Cell key={j}>
                                                      <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                                                  </Table.Cell>
                                              ))}
                                          </Table.Row>
                                      ))
                                    : (data?.data ?? []).map((row) => (
                                          <Table.Row key={row.uuid} id={row.uuid}>
                                              <Table.Cell className="text-xs text-muted whitespace-nowrap">
                                                  {formatDate(row.created_at)}
                                              </Table.Cell>
                                              <Table.Cell className="text-xs">
                                                  {OPERATION_LABELS[row.operation] ?? row.operation}
                                                  {row.request_mode === "BATCH" && (
                                                      <span className="ml-1.5 text-muted">(batch)</span>
                                                  )}
                                              </Table.Cell>
                                              <Table.Cell className="text-xs">
                                                  <span className="capitalize">{row.provider}</span>
                                                  <span className="text-muted"> · {row.model}</span>
                                              </Table.Cell>
                                              <Table.Cell className="text-xs tabular-nums">
                                                  {formatTokens(row.total_tokens)}
                                              </Table.Cell>
                                              <Table.Cell className="text-xs tabular-nums">
                                                  {formatCost(row.total_cost_usd)}
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <StatusChip status={row.status} />
                                              </Table.Cell>
                                          </Table.Row>
                                      ))}
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
                            pageSize={PAGE_LIMIT}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
