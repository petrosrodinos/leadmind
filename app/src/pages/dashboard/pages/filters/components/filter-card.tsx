import { useNavigate } from "react-router-dom";
import { Chip, Switch } from "@heroui/react";
import { Calendar } from "lucide-react";
import { SourceBadge } from "@/components/ui/source-badge";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { JobStatus, type Filter, type FilterJob } from "@/features/filters/interfaces/filter.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useFilterJobs, useRunFilter, useUpdateFilter } from "@/features/filters/hooks/use-filters";
import { humanizeCron } from "@/lib/cron";
import { Routes } from "@/routes/routes";
import { FilterRunButton } from "@/pages/dashboard/pages/filters/components/filter-run-controls";

const CHANNEL_LABEL: Record<Channel, string> = {
  [Channel.EMAIL]: "Email",
  [Channel.SMS]: "SMS",
  [Channel.LINKEDIN]: "LinkedIn",
  [Channel.PHONE_CALL]: "Call",
};

const JOB_STATUS_COLOR: Record<JobStatus, "default" | "success" | "warning" | "danger"> = {
  [JobStatus.PENDING]: "default",
  [JobStatus.RUNNING]: "warning",
  [JobStatus.COMPLETED]: "success",
  [JobStatus.FAILED]: "danger",
};

interface FilterCardProps {
  filter: Filter;
}

export function FilterCard({ filter }: FilterCardProps) {
  const navigate = useNavigate();
  const updateFilter = useUpdateFilter();
  const runFilter = useRunFilter();

  const { data: jobsPage } = useFilterJobs(filter.uuid, { page: 1, limit: 1 });
  const lastJob: FilterJob | undefined = jobsPage?.items[0];
  const isJobActive = lastJob?.status === JobStatus.RUNNING || lastJob?.status === JobStatus.PENDING;

  const isManual = filter.source_type === SourceType.MANUAL;
  const isStarting = runFilter.isPending && !isJobActive;
  const isJobRunning = isJobActive;

  const handleToggle = (next: boolean) => {
    updateFilter.mutate({ uuid: filter.uuid, payload: { enabled: next } });
  };

  const goToDetail = () => navigate(Routes.dashboard.filters_detail.replace(":uuid", filter.uuid));

  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 @container cursor-pointer transition-colors hover:border-accent/40 hover:bg-surface-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground truncate">{filter.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <SourceBadge source={filter.source_type} />
            {filter.channels.map((c) => (
              <Chip key={c} size="sm" variant="soft" color="accent">
                <Chip.Label>{CHANNEL_LABEL[c]}</Chip.Label>
              </Chip>
            ))}
          </div>
        </div>
        <div onClick={stopBubble} className="shrink-0 mt-0.5">
          <Switch isSelected={filter.enabled} isDisabled={updateFilter.isPending} onChange={handleToggle} aria-label={filter.enabled ? "Disable filter" : "Enable filter"}>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted min-w-0">
        <Calendar className="size-4 shrink-0" />
        <span className="truncate">{humanizeCron(filter.cron_schedule)}</span>
      </div>

      {lastJob && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="text-muted">Last run:</span>
          <Chip size="sm" variant="soft" color={JOB_STATUS_COLOR[lastJob.status]}>
            <Chip.Label>{lastJob.status}</Chip.Label>
          </Chip>
          {lastJob.status === JobStatus.COMPLETED && <span className="text-muted">{lastJob.leads_found} leads</span>}
          <span className="text-muted ml-auto whitespace-nowrap">{new Date(lastJob.started_at).toLocaleString()}</span>
        </div>
      )}

      <div onClick={stopBubble} className="mt-auto pt-1">
        <FilterRunButton onPress={() => runFilter.mutate(filter.uuid)} isStarting={isStarting} isJobRunning={isJobRunning} isManual={isManual} filterEnabled={filter.enabled} />
      </div>
    </div>
  );
}
