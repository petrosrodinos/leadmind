import { Button, Chip } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { Filter as FilterIcon, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLatestFilterJob } from "@/features/filters/hooks/use-filters";
import { JobStatus, type Filter } from "@/features/filters/interfaces/filter.interface";
import { Routes } from "@/routes/routes";
import { DashboardPanelHeader } from "./dashboard-panel-header";
import { DashboardEmptyState } from "./dashboard-shared";
import { cn } from "@/lib/utils";

interface DashboardFiltersCardProps {
  filters: Filter[];
  isLoading: boolean;
}

export function DashboardFiltersCard({ filters, isLoading }: DashboardFiltersCardProps) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <DashboardPanelHeader
        title="Your filters"
        subtitle="Scheduled lead sources"
        actionLabel="View all"
        onAction={() => navigate(Routes.dashboard.filters)}
      >
        <Button
          size="sm"
          className="h-7 text-xs"
          onPress={() => navigate(Routes.dashboard.filters_new)}
        >
          <Plus className="size-3" />
          New
        </Button>
      </DashboardPanelHeader>

      {isLoading ? (
        <ul className="divide-y divide-border/40" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="size-2 rounded-full bg-surface-secondary animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-surface-secondary animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-surface-secondary/70 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : filters.length === 0 ? (
        <DashboardEmptyState
          icon={FilterIcon}
          title="No filters yet"
          body="Create a filter to start scraping leads on a schedule."
          action={
            <Button size="sm" onPress={() => navigate(Routes.dashboard.filters_new)}>
              <Plus className="size-3.5" />
              Create filter
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border/40">
          {filters.slice(0, 6).map((f) => (
            <DashboardFilterRow key={f.uuid} filter={f} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DashboardFilterRow({ filter }: { filter: Filter }) {
  const { lastJob } = useLatestFilterJob(filter.uuid);
  const status = lastJob?.status;
  const isRunning = status === JobStatus.RUNNING || status === JobStatus.PENDING;
  const isFailed = status === JobStatus.FAILED;
  const isCompleted = status === JobStatus.COMPLETED;
  const tone = isRunning ? "warning" : isFailed ? "danger" : isCompleted ? "success" : "default";
  const dotColor = isRunning ? "bg-warning" : isFailed ? "bg-danger" : isCompleted ? "bg-success" : "bg-muted/30";

  const ts = lastJob?.completed_at ?? lastJob?.started_at ?? lastJob?.created_at;
  const subtitle = ts
    ? `${status?.toLowerCase() ?? ""} · ${formatDistanceToNow(new Date(ts), { addSuffix: true })}`
    : filter.enabled ? "Never run" : "Disabled";

  return (
    <li>
      <Link
        to={Routes.dashboard.filters_detail.replace(":uuid", filter.uuid)}
        className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-secondary/40 transition-colors"
      >
        <span className={cn("size-2 rounded-full shrink-0", dotColor, isRunning && "animate-pulse")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{filter.name}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
        {status && (
          <Chip size="sm" variant="soft" color={tone as any}>
            <Chip.Label className="text-[10px]">
              {lastJob?.leads_found != null ? `${lastJob.leads_found} leads` : status}
            </Chip.Label>
          </Chip>
        )}
      </Link>
    </li>
  );
}
