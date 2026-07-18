import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Routes } from "@/routes/routes";
import { DashboardSubnav } from "@/components/providers/dashboard-navbar-provider";
import { cn } from "@/lib/utils";

interface ListDetailToolbarProps {
    title: string;
    meta?: string;
    actions?: ReactNode;
    className?: string;
}

export const ListDetailToolbar: FC<ListDetailToolbarProps> = ({
    title,
    meta,
    actions,
    className,
}) => (
    <DashboardSubnav>
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5",
                "shadow-[0_1px_0_0_color-mix(in_oklch,var(--accent)_8%,transparent),0_8px_24px_-12px_color-mix(in_oklch,black_18%,transparent)]",
                className,
            )}
        >
            <Link
                to={Routes.dashboard.lists}
                className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                    "text-muted hover:text-foreground hover:bg-surface-secondary",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                )}
                aria-label="Back to lists"
            >
                <ArrowLeft className="size-4" strokeWidth={2} />
            </Link>

            <div className="hidden sm:block h-6 w-px shrink-0 bg-border" aria-hidden />

            <div className="min-w-0 flex-1">
                <h1 className="text-[15px] font-semibold tracking-tight text-foreground truncate leading-snug">
                    {title}
                </h1>
                {meta ? (
                    <p className="text-[11px] text-muted truncate mt-0.5 leading-none">{meta}</p>
                ) : null}
            </div>

            {actions ? <div className="shrink-0 flex items-center gap-2">{actions}</div> : null}
        </div>
    </DashboardSubnav>
);
