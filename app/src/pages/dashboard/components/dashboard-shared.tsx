import type { ComponentType } from "react";

export function DashboardListSkeleton() {
  return (
    <ul className="divide-y divide-border/40" aria-busy aria-label="Loading rows">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="size-8 shrink-0 rounded-full bg-surface-secondary animate-pulse" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-[44%] min-w-[7rem] rounded bg-surface-secondary animate-pulse" />
            <div className="h-2.5 w-[28%] min-w-[4rem] rounded bg-surface-secondary/70 animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardAvatar({ name }: { name: string | null }) {
  const initials =
    (name ?? "")
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/12 text-[11px] font-semibold text-accent">
      {initials}
    </span>
  );
}

interface DashboardEmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: React.ReactNode;
  dotted?: boolean;
}

export function DashboardEmptyState({ icon: Icon, title, body, action }: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[130px] flex-col items-center justify-center gap-2 px-5 pb-6 pt-5 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-secondary text-muted">
        <Icon className="size-4" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted">{body}</p>
      {action}
    </div>
  );
}
