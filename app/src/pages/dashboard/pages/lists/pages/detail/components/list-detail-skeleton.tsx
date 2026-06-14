export function ListDetailSkeleton() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            <div className="flex flex-col gap-4">
                <div className="h-4 w-28 rounded bg-surface-secondary" />

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="size-5 rounded bg-surface-secondary shrink-0 mt-1" />
                        <div className="min-w-0 space-y-2 flex-1">
                            <div className="h-6 w-48 max-w-full rounded bg-surface-secondary" />
                            <div className="h-3.5 w-72 max-w-full rounded bg-surface-secondary" />
                            <div className="h-3 w-24 rounded bg-surface-secondary" />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="h-8 w-28 rounded-lg bg-surface-secondary" />
                        <div className="h-8 w-20 rounded-lg bg-surface-secondary" />
                    </div>
                </div>
            </div>

            <div className="inline-flex gap-1 rounded-lg bg-surface-secondary/40 p-1 border border-border w-fit">
                <div className="h-8 w-20 rounded-md bg-surface-secondary" />
                <div className="h-8 w-20 rounded-md bg-surface-secondary" />
            </div>

            <div className="pt-2 space-y-4">
                <div className="h-5 w-36 rounded bg-surface-secondary" />
                <div className="overflow-hidden rounded-xl border border-border">
                    <div className="bg-surface-secondary/40 px-3 py-2 flex gap-4">
                        {[80, 72, 96, 56, 32].map((w, i) => (
                            <div
                                key={i}
                                className="h-3 rounded bg-surface-secondary"
                                style={{ width: `${w}px` }}
                            />
                        ))}
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border-t border-border px-3 py-3 flex gap-4 items-center">
                            <div className="h-3.5 w-32 rounded bg-surface-secondary" />
                            <div className="h-3 w-24 rounded bg-surface-secondary" />
                            <div className="h-3 w-40 rounded bg-surface-secondary" />
                            <div className="h-5 w-14 rounded-full bg-surface-secondary" />
                            <div className="h-8 w-8 rounded-lg bg-surface-secondary ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
