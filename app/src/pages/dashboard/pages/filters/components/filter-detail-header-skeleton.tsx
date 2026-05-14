export function FilterDetailHeaderSkeleton() {
  return (
    <div className="min-w-0 space-y-2">
      <div className="h-7 w-56 max-w-full rounded bg-surface-secondary animate-pulse" />
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="h-5 w-24 rounded-md bg-surface-secondary animate-pulse" />
        <div className="h-6 w-14 rounded-full bg-surface-secondary animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-surface-secondary animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-surface-secondary animate-pulse" />
      </div>
    </div>
  );
}

export function FilterDetailHeaderActionsSkeleton() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-6 w-16 rounded-full bg-surface-secondary animate-pulse" />
      <div className="size-9 rounded-lg border border-border bg-surface-secondary animate-pulse" />
    </div>
  );
}
