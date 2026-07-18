import { DashboardSubnav } from "@/components/providers/dashboard-navbar-provider";

export function ListDetailSkeleton() {
    return (
        <>
            <DashboardSubnav>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 animate-pulse">
                    <div className="size-9 rounded-lg bg-surface-secondary shrink-0" />
                    <div className="hidden sm:block h-6 w-px bg-border shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-4 w-56 max-w-full rounded bg-surface-secondary" />
                        <div className="h-3 w-20 rounded bg-surface-secondary" />
                    </div>
                    <div className="h-8 w-24 rounded-lg bg-surface-secondary shrink-0" />
                </div>
            </DashboardSubnav>

            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-3.5 w-80 max-w-full rounded bg-surface-secondary" />

                <div className="inline-flex gap-1 rounded-lg bg-surface-secondary/40 p-1 border border-border w-fit">
                    <div className="h-8 w-20 rounded-md bg-surface-secondary" />
                    <div className="h-8 w-20 rounded-md bg-surface-secondary" />
                </div>

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
        </>
    );
}
