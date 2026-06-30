export function UsageSummaryCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 min-w-[140px]">
            <div className="flex items-center gap-2 text-muted mb-1">
                <Icon className="size-3.5 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">{value}</p>
        </div>
    );
}
