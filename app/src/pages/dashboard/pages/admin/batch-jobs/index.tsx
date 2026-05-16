import { useSearchParams } from "react-router-dom";
import { Chip, ListBox, Select, Table } from "@heroui/react";
import { CheckCircle2, Clock, Layers, XCircle, AlertTriangle } from "lucide-react";
import { useBatchJobs } from "@/features/openai-batch-jobs/hooks/use-openai-batch-jobs";
import { OpenAiBatchJobType, OpenAiBatchStatus, type OpenAiBatchJob } from "@/features/openai-batch-jobs/interfaces/openai-batch-job.interface";
import { TablePagination } from "@/components/ui/table-pagination";

const PAGE_LIMIT = 20;

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const STATUS_META: Record<OpenAiBatchStatus, { label: string; color: ChipColor; icon: React.ComponentType<{ className?: string }> }> = {
    IN_PROGRESS: { label: "In Progress", color: "warning", icon: Clock },
    COMPLETED: { label: "Completed", color: "success", icon: CheckCircle2 },
    FAILED: { label: "Failed", color: "danger", icon: AlertTriangle },
    EXPIRED: { label: "Expired", color: "default", icon: XCircle },
    CANCELLED: { label: "Cancelled", color: "default", icon: XCircle },
};

const TYPE_LABELS: Record<OpenAiBatchJobType, string> = {
    CONTACT_SCORE: "Contact Score",
    LEAD_ENRICH: "Lead Enrich",
    MESSAGE_CREATE: "Message Create",
};

function formatDuration(createdAt: string, finishedAt: string | null): string {
    if (!finishedAt) return "—";
    const ms = new Date(finishedAt).getTime() - new Date(createdAt).getTime();
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
    return `${(ms / 3_600_000).toFixed(1)}h`;
}

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function StatusChip({ status }: { status: OpenAiBatchStatus }) {
    const { label, color, icon: Icon } = STATUS_META[status];
    return (
        <Chip size="sm" variant="soft" color={color}>
            <Icon className="size-3" />
            <Chip.Label>{label}</Chip.Label>
        </Chip>
    );
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

export default function AdminBatchJobsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Number(searchParams.get("page") ?? 1);
    const typeFilter = (searchParams.get("type") as OpenAiBatchJobType) || undefined;
    const statusFilter = (searchParams.get("status") as OpenAiBatchStatus) || undefined;

    const { data, isLoading } = useBatchJobs({ page, limit: PAGE_LIMIT, type: typeFilter, status: statusFilter });

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

    const totalPages = Math.ceil((data?.total ?? 0) / PAGE_LIMIT);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <Layers className="size-5 text-muted shrink-0" />
                    <div>
                        <h1 className="text-lg font-semibold text-foreground leading-tight">OpenAI Batch Jobs</h1>
                        <p className="text-xs text-muted mt-0.5">{data?.total ?? "—"} total · super-admin view</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <FilterSelect
                        label="All types"
                        value={typeFilter ?? ""}
                        options={Object.entries(TYPE_LABELS).map(([key, label]) => ({ key, label }))}
                        onChange={(v) => setParam("type", v)}
                    />
                    <FilterSelect
                        label="All statuses"
                        value={statusFilter ?? ""}
                        options={Object.keys(STATUS_META).map((s) => ({ key: s, label: STATUS_META[s as OpenAiBatchStatus].label }))}
                        onChange={(v) => setParam("status", v)}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="OpenAI Batch Jobs" className="min-w-[960px]">
                            <Table.Header>
                                <Table.Column id="batch_id" isRowHeader>
                                    Batch ID
                                </Table.Column>
                                <Table.Column id="type">Type</Table.Column>
                                <Table.Column id="status">Status</Table.Column>
                                <Table.Column id="requests">Requests</Table.Column>
                                <Table.Column id="duration">Duration</Table.Column>
                                <Table.Column id="user">User</Table.Column>
                                <Table.Column id="expires">Expires</Table.Column>
                                <Table.Column id="created">Created</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() =>
                                    isLoading ? null : (
                                        <div className="flex items-center justify-center py-12 text-center text-sm text-muted">
                                            No batch jobs found.
                                        </div>
                                    )
                                }
                            >
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                          <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                                              {Array.from({ length: 8 }).map((__, j) => (
                                                  <Table.Cell key={j}>
                                                      <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                                                  </Table.Cell>
                                              ))}
                                          </Table.Row>
                                      ))
                                    : (data?.data ?? []).map((job: OpenAiBatchJob) => (
                                          <Table.Row key={job.id} id={job.id}>
                                              <Table.Cell>
                                                  <span
                                                      className="font-mono text-[11px] text-muted truncate max-w-[140px] block"
                                                      title={job.batch_id}
                                                  >
                                                      {job.batch_id.slice(0, 20)}…
                                                  </span>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <span className="text-xs text-foreground">{TYPE_LABELS[job.type]}</span>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <StatusChip status={job.status} />
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <div className="text-xs leading-snug">
                                                      <span className="text-foreground font-medium">{job.total_requests}</span>
                                                      <span className="text-muted"> total</span>
                                                      {(job.completed_requests > 0 || job.failed_requests > 0) && (
                                                          <div className="text-muted mt-0.5">
                                                              <span className="text-[color:var(--success,#22c55e)]">{job.completed_requests} ok</span>
                                                              {" · "}
                                                              <span className="text-[color:var(--danger,#ef4444)]">{job.failed_requests} fail</span>
                                                          </div>
                                                      )}
                                                  </div>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <span className="text-xs text-foreground tabular-nums">
                                                      {formatDuration(job.created_at, job.finished_at)}
                                                  </span>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <span className="text-xs text-muted">{job.user.email}</span>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <span className="text-xs text-muted tabular-nums">{formatDate(job.expires_at)}</span>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <span className="text-xs text-muted tabular-nums">{formatDate(job.created_at)}</span>
                                              </Table.Cell>
                                          </Table.Row>
                                      ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>
            </div>

            {totalPages > 1 && (
                <TablePagination
                    page={page}
                    totalPages={totalPages}
                    total={data?.total ?? 0}
                    pageSize={PAGE_LIMIT}
                    onPageChange={setPage}
                    label="batch jobs"
                />
            )}
        </div>
    );
}
