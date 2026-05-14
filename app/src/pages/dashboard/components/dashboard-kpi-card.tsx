import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KPI_TONE } from "./dashboard.constants";

interface DashboardKpiCardProps {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof KPI_TONE;
  href?: string;
  valueLoading?: boolean;
}

export function DashboardKpiCard({ label, value, helper, icon: Icon, tone, href, valueLoading }: DashboardKpiCardProps) {
  const color = KPI_TONE[tone];
  const inner = (
    <div className="flex min-h-[150px] flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", color.bg, color.text)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          {valueLoading ? <div className="mt-4 h-8 w-20 rounded-md bg-surface-secondary animate-pulse" aria-hidden /> : <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</p>}
          <p className="mt-1 text-xs text-muted">{helper}</p>
        </div>
        {href && (
          <span className="mt-9 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-accent">
            <ArrowUpRight className="size-4" />
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <Link to={href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
      {inner}
    </Link>
  );
}
