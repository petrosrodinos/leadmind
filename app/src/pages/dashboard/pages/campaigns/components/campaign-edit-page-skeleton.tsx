export function CampaignEditPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-40 rounded bg-surface-secondary" />
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full rounded bg-surface-secondary" />
        <div className="h-4 w-full max-w-md rounded bg-surface-secondary" />
      </div>
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="h-5 w-36 rounded bg-surface-secondary" />
        <div className="h-10 w-full rounded-lg bg-surface-secondary" />
        <div className="h-10 w-full rounded-lg bg-surface-secondary" />
        <div className="h-28 w-full rounded-lg bg-surface-secondary" />
        <div className="h-10 w-32 rounded-lg bg-surface-secondary" />
      </div>
    </div>
  );
}
