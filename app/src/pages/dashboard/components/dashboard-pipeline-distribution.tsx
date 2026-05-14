import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import type { DashboardStats } from "@/features/dashboard/interfaces/dashboard.interface";
import { STATUS_LABEL } from "@/features/contacts/constants/contacts.constants";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";
import { EMPTY_BY_STATUS, STATUS_BAR_COLOR } from "./dashboard.constants";

interface DashboardPipelineDistributionProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function DashboardPipelineDistribution({ stats, isLoading }: DashboardPipelineDistributionProps) {
  const navigate = useNavigate();
  const statuses: LeadStatus[] = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.CONVERTED, LeadStatus.ARCHIVED];
  const byStatus = stats?.by_status ?? EMPTY_BY_STATUS;
  const total = stats?.total_contacts ?? 0;
  const max = Math.max(total, 1);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="grid gap-5 lg:grid-cols-[148px_minmax(0,1fr)_minmax(260px,0.95fr)_auto] lg:items-center">
        <FunnelIllustration />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Pipeline distribution</h2>
          <p className="mt-1 text-sm text-muted">How your contacts move through the funnel.</p>
          {isLoading ? (
            <div className="mt-4 h-4 w-full max-w-sm rounded-md bg-surface-secondary animate-pulse" aria-hidden />
          ) : total === 0 ? (
            <p className="mt-4 text-sm italic text-muted">Nothing in the pipeline yet, adopt a lead from the directory to start.</p>
          ) : (
            <div className="mt-4">
              <div className="flex h-3 w-full max-w-xl overflow-hidden rounded-full bg-surface-secondary">
                {statuses.map((s) => {
                  const count = byStatus[s] ?? 0;
                  if (count === 0) return null;
                  return <div key={s} className={cn("h-full", STATUS_BAR_COLOR[s])} style={{ width: `${(count / max) * 100}%` }} title={`${STATUS_LABEL[s]}: ${count}`} />;
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {statuses.map((s) => (
                  <span key={s} className="inline-flex items-center gap-2 text-xs text-muted">
                    <span className={cn("size-2 rounded-full", STATUS_BAR_COLOR[s])} />
                    {STATUS_LABEL[s]} {byStatus[s] ?? 0}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <PipelineTrace />
        <Button size="sm" variant="secondary" className="justify-self-start rounded-full px-5 lg:justify-self-end" onPress={() => navigate(Routes.dashboard.contacts)}>
          Open pipeline
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </section>
  );
}

function FunnelIllustration() {
  return (
    <div aria-hidden className="relative hidden h-24 w-32 sm:block">
      <div className="absolute left-4 top-2 h-4 w-20 rounded-sm bg-accent/35 [clip-path:polygon(0_0,100%_0,90%_100%,10%_100%)]" />
      <div className="absolute left-8 top-7 h-4 w-14 rounded-sm bg-accent/45 [clip-path:polygon(0_0,100%_0,84%_100%,16%_100%)]" />
      <div className="absolute left-11 top-12 h-4 w-9 rounded-sm bg-accent/55 [clip-path:polygon(0_0,100%_0,76%_100%,24%_100%)]" />
      <div className="absolute left-[50px] top-[68px] h-5 w-5 rounded-sm bg-accent/40" />
      <span className="absolute right-4 top-10 size-5 rounded-full border border-border bg-surface" />
      <span className="absolute right-0 top-16 size-5 rounded-full border border-border bg-surface" />
    </div>
  );
}

function PipelineTrace() {
  return (
    <div aria-hidden className="relative hidden h-16 min-w-[260px] lg:block">
      <svg className="h-full w-full text-accent/30" viewBox="0 0 280 64" fill="none">
        <path d="M5 32 C 42 6, 55 55, 92 28 S 145 6, 178 34 S 225 57, 275 20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
      </svg>
      <span className="absolute left-[2%] top-[43%] size-2.5 rounded-full bg-accent" />
      <span className="absolute left-[27%] top-[58%] size-2.5 rounded-full bg-accent/60" />
      <span className="absolute left-[53%] top-[12%] size-2.5 rounded-full bg-success" />
      <span className="absolute left-[79%] top-[55%] size-2.5 rounded-full bg-warning" />
      <span className="absolute right-[3%] top-[9%] size-2.5 rounded-full bg-accent" />
    </div>
  );
}
