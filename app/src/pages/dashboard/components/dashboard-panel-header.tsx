import type { ComponentType, ReactNode } from "react";
import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";

interface DashboardPanelHeaderProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function DashboardPanelHeader({ title, subtitle, actionLabel, onAction, children }: DashboardPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/50">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {(actionLabel || children) && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
          {actionLabel && (
            <Button size="sm" variant="secondary" className="h-7 text-xs" onPress={onAction}>
              {actionLabel}
              <ArrowRight className="size-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
