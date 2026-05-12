export function CampaignDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* back link */}
            <div className="h-4 w-32 rounded bg-surface-secondary" />

            {/* header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="h-6 w-48 rounded bg-surface-secondary" />
                        <div className="h-5 w-20 rounded-full bg-surface-secondary" />
                    </div>
                    <div className="h-3.5 w-72 rounded bg-surface-secondary" />
                    <div className="h-3 w-56 rounded bg-surface-secondary" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-surface-secondary shrink-0" />
            </div>

            {/* stats grid */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-surface p-3 space-y-2">
                        <div className="h-3 w-16 rounded bg-surface-secondary" />
                        <div className="h-7 w-10 rounded bg-surface-secondary" />
                    </div>
                ))}
            </div>

            {/* recipients section */}
            <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-surface-secondary" />
                <div className="overflow-hidden rounded-xl border border-border">
                    {/* table header */}
                    <div className="bg-surface-secondary/40 px-3 py-2 flex gap-4">
                        {[100, 60, 60, 80, 80, 60].map((w, i) => (
                            <div key={i} className="h-3 rounded bg-surface-secondary" style={{ width: `${w}px` }} />
                        ))}
                    </div>
                    {/* table rows */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border-t border-border px-3 py-3 flex gap-4 items-center">
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="h-3.5 w-28 rounded bg-surface-secondary" />
                                <div className="h-3 w-36 rounded bg-surface-secondary" />
                            </div>
                            <div className="h-3 w-12 rounded bg-surface-secondary" />
                            <div className="h-5 w-16 rounded-full bg-surface-secondary" />
                            <div className="h-3 w-24 rounded bg-surface-secondary" />
                            <div className="h-3 w-24 rounded bg-surface-secondary" />
                            <div className="h-3 w-16 rounded bg-surface-secondary" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
