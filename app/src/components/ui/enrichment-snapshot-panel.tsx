import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrichmentSnapshotPanelProps {
  summary: string | null | undefined;
  metadata?: unknown;
  emptyLabel?: string;
  className?: string;
  action?: ReactNode;
  hideWhenEmpty?: boolean;
  variant?: "snapshot" | "scrollOnly";
  scrollClassName?: string;
  textClassName?: string;
}

function hasMetadataToShow(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length > 0;
}

function EnrichmentSummaryInner({
  summary,
  emptyLabel,
  scrollClassName,
  textClassName,
}: {
  summary: string | null | undefined;
  emptyLabel: string;
  scrollClassName?: string;
  textClassName?: string;
}) {
  const text = summary?.trim();
  if (!text) {
    return <p className="text-sm text-muted italic">{emptyLabel}</p>;
  }
  return (
    <div className={cn("max-h-48 overflow-y-auto overscroll-contain rounded-md pr-1 [scrollbar-gutter:stable]", scrollClassName)}>
      <p className={cn("text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground", textClassName)}>{text}</p>
    </div>
  );
}

function EnrichmentMetadataBlock({ metadata }: { metadata: Record<string, unknown> }) {
  let formatted: string;
  try {
    formatted = JSON.stringify(metadata, null, 2);
  } catch {
    formatted = String(metadata);
  }
  return (
    <details className="mt-3 border-t border-accent/15 pt-3 text-xs">
      <summary className="cursor-pointer text-muted hover:text-foreground">Enrichment metadata</summary>
      <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-surface-secondary p-3 font-mono text-xs leading-relaxed text-foreground/90 border border-border [scrollbar-gutter:stable] whitespace-pre-wrap break-words">
        {formatted}
      </pre>
    </details>
  );
}

export function EnrichmentSnapshotPanel({
  summary,
  metadata,
  emptyLabel = "No enrichment summary yet.",
  className,
  action,
  hideWhenEmpty = false,
  variant = "snapshot",
  scrollClassName,
  textClassName,
}: EnrichmentSnapshotPanelProps) {
  const metaObj = hasMetadataToShow(metadata) ? metadata : null;
  const hasSummary = Boolean(summary?.trim());

  if (variant === "scrollOnly") {
    return <EnrichmentSummaryInner summary={summary} emptyLabel={emptyLabel} scrollClassName={scrollClassName} textClassName={textClassName} />;
  }

  if (hideWhenEmpty && !hasSummary && !metaObj) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {action ? <div className="mb-3 flex justify-end">{action}</div> : null}
      <div className="relative rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3 sm:px-5">
        <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          <Sparkles className="size-3.5" strokeWidth={2} />
          Enrichment snapshot
        </p>
        <EnrichmentSummaryInner
          summary={summary}
          emptyLabel={emptyLabel}
          scrollClassName={scrollClassName}
          textClassName={textClassName ?? "text-foreground/90"}
        />
        {metaObj ? <EnrichmentMetadataBlock metadata={metaObj} /> : null}
      </div>
    </div>
  );
}
