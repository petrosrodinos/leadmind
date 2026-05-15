import type { ComponentType } from "react";
import { Link } from "react-router-dom";
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

  const content = (
    <div className={cn(
      "flex flex-col gap-3 rounded-xl border border-border/60 bg-surface p-5",
      href && "transition-colors hover:border-accent/40 hover:bg-surface-secondary/30"
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={cn("inline-flex size-8 items-center justify-center rounded-lg", color.bg, color.text)}>
          <Icon className="size-4" />
        </span>
      </div>

      {valueLoading ? (
        <div className="h-9 w-24 rounded-lg bg-surface-secondary animate-pulse" aria-hidden />
      ) : (
        <p className="text-4xl font-bold tabular-nums text-foreground tracking-tight leading-none">
          {value}
        </p>
      )}

      <p className="text-xs text-muted">{helper}</p>
    </div>
  );

  if (!href) return content;

  return (
    <Link to={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      {content}
    </Link>
  );
}
