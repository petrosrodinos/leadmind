import type { ComponentType, ReactNode } from "react";

export function SectionCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-sm shadow-[0_1px_0_oklch(1_0_0/0.04)_inset] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 bg-surface-secondary/40">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
            </div>
            <div className="p-4 space-y-4">{children}</div>
        </section>
    );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-[minmax(0,8.5rem)_1fr] sm:gap-4 sm:items-start">
            <p className="text-xs font-medium text-muted pt-0.5">{label}</p>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export function ProfileValue({
    value,
    href,
    emptyLabel = "—",
}: {
    value: string | null | undefined;
    href?: string;
    emptyLabel?: string;
}) {
    if (!value?.trim()) {
        return (
            <p className="text-sm text-muted/70 tabular-nums" aria-label="Empty">
                {emptyLabel}
            </p>
        );
    }
    const text = value.trim();
    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-link hover:underline break-all">
                {text}
            </a>
        );
    }
    return <p className="text-sm font-medium text-foreground whitespace-pre-line break-words">{text}</p>;
}
