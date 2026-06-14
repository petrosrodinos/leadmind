import { useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ContactAudienceScope } from "@/features/contact-audience-stats/interfaces/contact-audience-stats.interface";
import type {
    ContactAudienceAnalysis,
    ContactAudienceAnalysisContent,
    AudienceAnalysisComparison,
} from "@/features/contact-audience-stats/interfaces/contact-audience-analysis.interface";
import {
    useContactAudienceAnalyses,
    useCreateContactAudienceAnalysis,
    useDeleteContactAudienceAnalysis,
} from "@/features/contact-audience-stats/hooks/use-contact-audience-analysis";
import { cn } from "@/lib/utils";

interface AudienceAiAnalysisSectionProps {
    scope: ContactAudienceScope;
}

function formatAnalysisDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function isAnalysisContent(
    value: ContactAudienceAnalysisContent | Record<string, never>,
): value is ContactAudienceAnalysisContent {
    return typeof value === "object" && value !== null && "summary" in value && typeof value.summary === "string";
}

function AnalysisBulletList({
    title,
    items,
    tone = "neutral",
}: {
    title: string;
    items: string[];
    tone?: "neutral" | "primary" | "success" | "warning" | "error";
}) {
    if (items.length === 0) return null;

    const toneClass =
        tone === "primary"
            ? "text-accent"
            : tone === "success"
            ? "text-success"
            : tone === "warning"
              ? "text-warning"
              : tone === "error"
                ? "text-danger"
                : "text-foreground";

    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
            <ul className="space-y-1.5">
                {items.map((item, index) => (
                    <li key={`${title}-${index}`} className={cn("text-sm leading-relaxed", toneClass)}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AnalysisComparison({ comparison }: { comparison: AudienceAnalysisComparison }) {
    const hasContent =
        comparison.summary.trim().length > 0 ||
        comparison.changed.length > 0 ||
        comparison.unchanged.length > 0;

    if (!hasContent) return null;

    return (
        <div className="rounded-lg border border-border bg-surface-secondary/80 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Compared to previous run
            </p>
            {comparison.summary ? (
                <p className="mb-3 text-sm leading-relaxed text-foreground/90">{comparison.summary}</p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
                <AnalysisBulletList title="Changed" items={comparison.changed} tone="primary" />
                <AnalysisBulletList title="Unchanged" items={comparison.unchanged} />
            </div>
        </div>
    );
}

function AnalysisContent({ content }: { content: ContactAudienceAnalysisContent }) {
    return (
        <div className="space-y-4">
            {content.comparison ? <AnalysisComparison comparison={content.comparison} /> : null}
            <p className="text-sm leading-relaxed text-foreground/90">{content.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
                <AnalysisBulletList title="Strengths" items={content.strengths} tone="success" />
                <AnalysisBulletList title="Weaknesses" items={content.weaknesses} tone="warning" />
            </div>
            <AnalysisBulletList title="Recommendations" items={content.recommendations} />
            <AnalysisBulletList title="Risks" items={content.risks} tone="error" />
        </div>
    );
}

function AnalysisReportActions({
    item,
    onDelete,
    isDeleting,
}: {
    item: ContactAudienceAnalysis;
    onDelete: (item: ContactAudienceAnalysis) => void;
    isDeleting: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                    item.status === "COMPLETED" && "bg-success/10 text-success",
                    item.status === "FAILED" && "bg-danger/10 text-danger",
                    item.status === "PENDING" && "bg-warning/10 text-warning",
                )}
            >
                {item.status.toLowerCase()}
            </span>
            <Button
                size="sm"
                variant="tertiary"
                className="text-danger"
                isDisabled={isDeleting}
                onPress={() => onDelete(item)}
                aria-label="Delete analysis"
            >
                <Trash2 className="size-3.5" />
            </Button>
        </div>
    );
}

export function AudienceAiAnalysisSection({ scope }: AudienceAiAnalysisSectionProps) {
    const { data, isLoading } = useContactAudienceAnalyses(scope);
    const createAnalysis = useCreateContactAudienceAnalysis();
    const deleteAnalysis = useDeleteContactAudienceAnalysis();
    const [deleteTarget, setDeleteTarget] = useState<ContactAudienceAnalysis | null>(null);

    const latest = data?.items[0];
    const history = useMemo(() => data?.items.slice(1) ?? [], [data?.items]);
    const latestContent = latest && isAnalysisContent(latest.analysis) ? latest.analysis : null;

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        deleteAnalysis.mutate(
            { scope, analysisUuid: deleteTarget.uuid },
            { onSuccess: () => setDeleteTarget(null) },
        );
    };

    return (
        <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        <Sparkles className="size-3.5" strokeWidth={2} />
                        AI analysis
                    </p>
                    <p className="mt-1 text-sm text-muted">
                        Full-history stats analysis. Each run is saved as a new report.
                    </p>
                </div>
                <ActionButtonWithPending
                    size="sm"
                    variant="secondary"
                    isPending={createAnalysis.isPending}
                    isDisabled={createAnalysis.isPending}
                    idleLeading={<Sparkles className="size-3.5" />}
                    onPress={() => createAnalysis.mutate(scope)}
                >
                    Run AI analysis
                </ActionButtonWithPending>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted">Loading analyses…</p>
            ) : latest ? (
                <div className="space-y-4">
                    <div className="rounded-lg border border-accent/20 bg-accent/[0.06] px-4 py-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-muted">
                                Latest · {formatAnalysisDate(latest.created_at)}
                            </p>
                            <AnalysisReportActions
                                item={latest}
                                onDelete={setDeleteTarget}
                                isDeleting={deleteAnalysis.isPending}
                            />
                        </div>

                        {latest.status === "FAILED" ? (
                            <p className="text-sm text-danger">{latest.error || "Analysis failed."}</p>
                        ) : latestContent ? (
                            <AnalysisContent content={latestContent} />
                        ) : (
                            <p className="text-sm text-muted">Analysis is processing…</p>
                        )}
                    </div>

                    {history.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                Previous reports ({history.length})
                            </p>
                            {history.map((item) => {
                                const content = isAnalysisContent(item.analysis) ? item.analysis : null;
                                return (
                                    <details
                                        key={item.uuid}
                                        className="rounded-lg border border-border bg-surface-secondary px-3 py-2"
                                    >
                                        <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium text-foreground">
                                            <span>
                                                {formatAnalysisDate(item.created_at)}
                                                <span className="ml-2 text-xs font-normal text-muted">
                                                    {item.status.toLowerCase()}
                                                </span>
                                            </span>
                                            <span
                                                onClick={(event) => event.stopPropagation()}
                                                onKeyDown={(event) => event.stopPropagation()}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="tertiary"
                                                    className="text-danger shrink-0"
                                                    isDisabled={deleteAnalysis.isPending}
                                                    onPress={() => setDeleteTarget(item)}
                                                    aria-label="Delete analysis"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </span>
                                        </summary>
                                        <div className="mt-3 border-t border-border pt-3">
                                            {item.status === "FAILED" ? (
                                                <p className="text-sm text-danger">{item.error || "Analysis failed."}</p>
                                            ) : content ? (
                                                <AnalysisContent content={content} />
                                            ) : (
                                                <p className="text-sm text-muted">No analysis content.</p>
                                            )}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ) : (
                <p className="text-sm text-muted">
                    No AI analysis yet. Run one to get recommendations based on full audience history.
                </p>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title="Delete this analysis report?"
                description={
                    deleteTarget
                        ? `This permanently removes the report from ${formatAnalysisDate(deleteTarget.created_at)}.`
                        : undefined
                }
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={deleteAnalysis.isPending}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}
