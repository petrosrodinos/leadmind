import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function DashboardListSkeleton() {
  return (
    <ul className="space-y-3 px-5 pb-5" aria-busy aria-label="Loading rows">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-xl bg-surface-secondary animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-[45%] min-w-[8rem] rounded-md bg-surface-secondary animate-pulse" />
            <div className="h-3 w-[30%] min-w-[5rem] rounded-md bg-surface-secondary animate-pulse" />
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

  return <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-xs font-semibold text-accent">{initials}</span>;
}

interface DashboardEmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: React.ReactNode;
  dotted?: boolean;
}

export function DashboardEmptyState({ icon: Icon, title, body, action, dotted }: DashboardEmptyStateProps) {
  return (
    <div className={cn("relative flex min-h-[168px] flex-col items-center justify-center gap-2 px-5 pb-9 pt-5 text-center", dotted && "overflow-hidden")}>
      {dotted && <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(color-mix(in_oklch,var(--accent)_25%,transparent)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />}
      <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon className="size-5" />
      </span>
      <p className="relative text-sm font-semibold text-foreground">{title}</p>
      <p className="relative max-w-xs text-xs text-muted">{body}</p>
      {action}
    </div>
  );
}
