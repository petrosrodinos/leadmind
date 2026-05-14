import { Button, Chip } from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { Filter as FilterIcon, MoreVertical, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLatestFilterJob } from "@/features/filters/hooks/use-filters";
import { JobStatus, type Filter } from "@/features/filters/interfaces/filter.interface";
import { Routes } from "@/routes/routes";
import { DashboardPanelHeader } from "./dashboard-panel-header";
import { DashboardEmptyState } from "./dashboard-shared";

interface DashboardFiltersCardProps {
  filters: Filter[];
  isLoading: boolean;
}

export function DashboardFiltersCard({ filters, isLoading }: DashboardFiltersCardProps) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <DashboardPanelHeader icon={FilterIcon} title="Your filters" subtitle="Saved hunts that pull leads automatically." actionLabel="View all" onAction={() => navigate(Routes.dashboard.filters)}>
        <Button size="sm" className="rounded-full px-5" onPress={() => navigate(Routes.dashboard.filters_new)}>
          <Plus className="size-3.5" />
          New filter
        </Button>
      </DashboardPanelHeader>

      {isLoading ? (
        <ul className="grid gap-3 px-5 pb-5 md:grid-cols-2" aria-busy aria-label="Loading filters">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="h-[72px] rounded-xl border border-border bg-surface-secondary/30 animate-pulse" />
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
        <ul className="grid gap-3 px-5 pb-5 md:grid-cols-2">
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
  const tone = status === JobStatus.RUNNING || status === JobStatus.PENDING ? "warning" : status === JobStatus.FAILED ? "danger" : status === JobStatus.COMPLETED ? "success" : "default";

  const ts = lastJob?.completed_at ?? lastJob?.started_at ?? lastJob?.created_at;
  const subtitle = ts
    ? `${status?.toLowerCase() ?? "No status"} - ${formatDistanceToNow(new Date(ts), {
        addSuffix: true,
      })}`
    : filter.enabled
      ? "Never run"
      : "Disabled";

  return (
    <li>
      <Link to={Routes.dashboard.filters_detail.replace(":uuid", filter.uuid)} className="flex min-h-[72px] items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent/40">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/10 text-accent">
          <FilterIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{filter.name}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
        {status && (
          <Chip size="sm" variant="soft" color={tone as any}>
            <Chip.Label>{lastJob?.leads_found != null ? `${lastJob.leads_found} leads` : status}</Chip.Label>
          </Chip>
        )}
        <MoreVertical className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  );
}
