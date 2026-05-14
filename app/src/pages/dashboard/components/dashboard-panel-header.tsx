import type { ComponentType, ReactNode } from "react";
import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";

interface DashboardPanelHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function DashboardPanelHeader({ icon: Icon, title, subtitle, actionLabel, onAction, children }: DashboardPanelHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/10 text-accent">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {(actionLabel || children) && (
        <div className="flex flex-wrap items-center gap-2">
          {actionLabel && (
            <Button size="sm" variant="secondary" className="rounded-full px-5" onPress={onAction}>
              {actionLabel}
              <ArrowRight className="size-3.5" />
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
