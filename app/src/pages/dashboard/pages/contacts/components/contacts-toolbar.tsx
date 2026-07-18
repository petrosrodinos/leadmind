import type { FC, ReactNode } from "react";
import { DashboardSubnav } from "@/components/providers/dashboard-navbar-provider";
import { cn } from "@/lib/utils";

interface ContactsToolbarProps {
    title?: string;
    meta?: string;
    actions?: ReactNode;
    className?: string;
}

export const ContactsToolbar: FC<ContactsToolbarProps> = ({
    title = "Contacts",
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
