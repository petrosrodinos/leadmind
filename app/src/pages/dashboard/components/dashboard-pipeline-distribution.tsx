import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DashboardStats } from "@/features/dashboard/interfaces/dashboard.interface";
import { LEAD_STATUS_VALUES, STATUS_LABEL } from "@/features/contacts/constants/contacts.constants";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";
import { EMPTY_BY_STATUS, STATUS_BAR_COLOR } from "./dashboard.constants";

interface DashboardPipelineDistributionProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function DashboardPipelineDistribution({ stats, isLoading }: DashboardPipelineDistributionProps) {
  const navigate = useNavigate();
  const statuses = LEAD_STATUS_VALUES;
  const byStatus = stats?.by_status ?? EMPTY_BY_STATUS;
  const total = stats?.total_contacts ?? 0;

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <p className="text-sm font-semibold text-foreground">Pipeline</p>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs"
          onPress={() => navigate(Routes.dashboard.contacts)}
        >
          View pipeline
          <ArrowRight className="size-3" />
        </Button>
      </div>

      {isLoading ? (
        <div className="px-5 py-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[100px_minmax(0,1fr)_52px_38px] items-center gap-4">
              <div className="h-3 w-16 rounded bg-surface-secondary animate-pulse" />
              <div className="h-1.5 rounded-full bg-surface-secondary animate-pulse" />
              <div className="h-3 w-8 rounded bg-surface-secondary animate-pulse ml-auto" />
              <div className="h-3 w-6 rounded bg-surface-secondary animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <div className="flex items-center justify-center min-h-[120px] px-5">
          <p className="text-sm text-muted text-center">
            Nothing in the pipeline yet — adopt a lead from the directory to start.
          </p>
        </div>
      ) : (
        <div className="px-5 py-5 space-y-4">
          {statuses.map((s) => {
            const count = byStatus[s] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={s} className="grid grid-cols-[100px_minmax(0,1fr)_52px_38px] items-center gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("size-1.5 rounded-full shrink-0", STATUS_BAR_COLOR[s])} />
                  <p className="text-xs text-muted truncate">{STATUS_LABEL[s]}</p>
                </div>
                <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", STATUS_BAR_COLOR[s])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-sm font-semibold tabular-nums text-foreground text-right">
                  {count.toLocaleString()}
                </p>
                <p className="text-xs tabular-nums text-muted text-right">{pct.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
