import { Chip, Table } from "@heroui/react";
import { TablePagination } from "@/components/ui/table-pagination";
import { Clock, Hand } from "lucide-react";
import {
    JobStatus,
    JobTrigger,
    type FilterJob,
} from "@/features/filters/interfaces/filter.interface";

const JOB_STATUS_COLOR: Record<JobStatus, "default" | "success" | "warning" | "danger"> = {
    [JobStatus.PENDING]: "default",
    [JobStatus.RUNNING]: "warning",
    [JobStatus.COMPLETED]: "success",
    [JobStatus.FAILED]: "danger",
};

const JOB_TRIGGER_LABEL: Record<JobTrigger, string> = {
    [JobTrigger.MANUAL]: "Manual",
    [JobTrigger.SCHEDULED]: "Scheduled",
};

const formatDuration = (ms: number): string => {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)}s`;
    const m = Math.floor(s / 60);
    const rs = Math.round(s % 60);
    return `${m}m ${rs}s`;
};

interface JobHistoryTableProps {
    jobs: FilterJob[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function JobHistoryTable({
    jobs,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    onPageChange,
}: JobHistoryTableProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Filter job history" className="min-w-[920px]">
                        <Table.Header>
                            <Table.Column id="started_at" isRowHeader>
                                Started
                            </Table.Column>
                            <Table.Column id="trigger">Trigger</Table.Column>
                            <Table.Column id="status">Status</Table.Column>
                            <Table.Column id="leads_found">Leads found</Table.Column>
                            <Table.Column id="duration">Duration</Table.Column>
                            <Table.Column id="error">Error</Table.Column>
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() =>
                                isLoading ? null : (
                                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center text-muted">
                                        <p className="text-sm">No jobs yet.</p>
                                        <p className="text-xs">
                                            Trigger a manual run or wait for the schedule.
                                        </p>
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
                                : jobs.map((job) => {
                                      const TriggerIcon =
                                          job.trigger === JobTrigger.MANUAL ? Hand : Clock;
                                      return (
                                          <Table.Row key={job.uuid} id={job.uuid}>
                                              <Table.Cell>
                                                  {new Date(job.started_at).toLocaleString()}
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <Chip size="sm" variant="soft">
                                                      <TriggerIcon className="size-3" />
                                                      <Chip.Label>
                                                          {JOB_TRIGGER_LABEL[job.trigger] ??
                                                              job.trigger}
                                                      </Chip.Label>
                                                  </Chip>
                                              </Table.Cell>
                                              <Table.Cell>
                                                  <Chip
                                                      size="sm"
                                                      variant="soft"
                                                      color={JOB_STATUS_COLOR[job.status]}
                                                  >
                                                      <Chip.Label>{job.status}</Chip.Label>
                                                  </Chip>
                                              </Table.Cell>
                                              <Table.Cell>{job.leads_found}</Table.Cell>
                                              <Table.Cell>
                                                  {formatDuration(job.duration)}
                                              </Table.Cell>
                                              <Table.Cell>
                                                  {job.error ? (
                                                      <span
                                                          className="text-danger text-xs truncate max-w-[280px] inline-block align-middle"
                                                          title={job.error}
                                                      >
                                                          {job.error}
                                                      </span>
                                                  ) : (
                                                      <span className="text-muted">—</span>
                                                  )}
                                              </Table.Cell>
                                          </Table.Row>
                                      );
                                  })}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
                <Table.Footer>
                    <TablePagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={onPageChange} isFetching={isFetching} isLoading={isLoading} label="jobs" />
                </Table.Footer>
            </Table>
        </div>
    );
}
