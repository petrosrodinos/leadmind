import { useEffect, useMemo, useState } from "react";
import { Checkbox, Modal, Popover } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_ENRICHMENT_SOURCES,
    ENRICHMENT_SOURCE_ICON,
    ENRICHMENT_SOURCE_OPTIONS,
    EnrichmentSource as EnrichmentSourceEnum,
    type EnrichmentSource,
} from "@/features/enrichment/constants/enrichment-sources";

export type EnrichmentActionMode = "contact" | "lead";

export interface EnrichmentActionPopoverProps {
    mode: EnrichmentActionMode;
    initialSources?: EnrichmentSource[];
    sourceOptions?: EnrichmentSourceOption[];
    isPending: boolean;
    onEnrich: (sources: EnrichmentSource[], options?: { use_batch?: boolean }) => void;
    placement?: "bottom start" | "bottom end" | "top start" | "top end";
    triggerSize?: "sm" | "md" | "lg";
    triggerVariant?: "primary" | "secondary" | "tertiary";
}

export interface EnrichmentRunModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: EnrichmentActionMode;
    initialSources?: EnrichmentSource[];
    sourceOptions?: EnrichmentSourceOption[];
    isPending: boolean;
    onEnrich: (sources: EnrichmentSource[], options?: { use_batch?: boolean }) => void;
    contextHint?: string;
}

const SOURCE_META: Record<EnrichmentSource, { hint: string; iconWrap: string }> = {
    [EnrichmentSourceEnum.LINKEDIN]: {
        hint: "Profile & org",
        iconWrap: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25",
    },
    [EnrichmentSourceEnum.WEBSITE]: {
        hint: "Site content",
        iconWrap: "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
    },
    [EnrichmentSourceEnum.GOOGLE_SEARCH]: {
        hint: "Web discovery",
        iconWrap:
            "bg-orange-500/28 text-orange-50 ring-1 ring-orange-300/50 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]",
    },
    [EnrichmentSourceEnum.AI]: {
        hint: "AI summary",
        iconWrap: "bg-accent/18 text-accent ring-1 ring-accent/35",
    },
    [EnrichmentSourceEnum.GEMI]: {
        hint: "Registry refresh",
        iconWrap: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30",
    },
};

type EnrichmentSourceOption = { id: EnrichmentSource; label: string };

function baselineSources(
    mode: EnrichmentActionMode,
    initialSources: EnrichmentSource[] | undefined,
): EnrichmentSource[] {
    if (initialSources !== undefined) {
        return initialSources;
    }
    return mode === "lead" ? DEFAULT_ENRICHMENT_SOURCES : [];
}

function EnrichmentRunPanel({
    isActive,
    mode,
    initialSources,
    sourceOptions = ENRICHMENT_SOURCE_OPTIONS,
    isPending,
    onCancel,
    onConfirm,
    contextHint,
}: {
    isActive: boolean;
    mode: EnrichmentActionMode;
    initialSources?: EnrichmentSource[];
    sourceOptions?: EnrichmentSourceOption[];
    isPending: boolean;
    onCancel: () => void;
    onConfirm: (sources: EnrichmentSource[], options?: { use_batch?: boolean }) => void;
    contextHint?: string;
}) {
    const [selected, setSelected] = useState<EnrichmentSource[]>([]);
    const [useBatch, setUseBatch] = useState(mode === "lead");

    const baseline = useMemo(
        () => baselineSources(mode, initialSources),
        [mode, initialSources],
    );

    useEffect(() => {
        if (isActive) {
            setSelected(baseline);
            setUseBatch(mode === "lead");
        }
    }, [isActive, baseline, mode]);

    const toggleSource = (id: EnrichmentSource) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    };

    const handleConfirm = () => {
        if (selected.length === 0) return;
        onConfirm(selected, mode === "lead" ? { use_batch: useBatch } : undefined);
    };

    return (
        <>
            <div className="relative px-3 pt-3 pb-2 border-b border-border/60 overflow-hidden">
                <div
                    className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-accent/20 blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -left-4 bottom-0 size-16 rounded-full bg-link/10 blur-xl"
                    aria-hidden
                />
                <div className="relative flex gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-accent/30 to-accent/5 text-accent shadow-[inset_0_1px_0_0_oklch(1_0_0/0.12)] ring-1 ring-accent/25">
                        <Sparkles className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 pt-px">
                        <p className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                            Run enrichment
                        </p>
                        <p className="text-[11px] text-muted leading-snug mt-0.5">
                            {contextHint ?? "Pick sources; we queue one job per run."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-2.5 py-2 space-y-1">
                {sourceOptions.map((opt) => {
                    const meta = SOURCE_META[opt.id];
                    const Icon = ENRICHMENT_SOURCE_ICON[opt.id];
                    const isOn = selected.includes(opt.id);
                    return (
                        <div
                            key={opt.id}
                            role="checkbox"
                            aria-checked={isOn}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") {
                                    e.preventDefault();
                                    toggleSource(opt.id);
                                }
                            }}
                            onClick={() => toggleSource(opt.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-lg border px-2 py-1.5 cursor-pointer select-none",
                                "outline-none transition-[background,border-color,box-shadow,transform] duration-150",
                                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--overlay)]",
                                "active:scale-[0.99]",
                                isOn
                                    ? "border-accent/40 bg-accent/[0.09] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
                                    : "border-border/60 bg-surface-secondary/25 hover:bg-surface-secondary/50 hover:border-border",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                                    meta.iconWrap,
                                )}
                                aria-hidden
                            >
                                <Icon className="size-3.5" strokeWidth={2} />
                            </span>
                            <div className="min-w-0 flex-1 leading-none">
                                <p className="text-xs font-medium text-foreground">
                                    {opt.label}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5">
                                    {meta.hint}
                                </p>
                            </div>
                            <span
                                className={cn(
                                    "flex size-5 shrink-0 items-center justify-center rounded border transition-colors duration-150",
                                    isOn
                                        ? "border-accent/60 bg-accent text-accent-foreground shadow-sm"
                                        : "border-border/80 bg-surface-tertiary/40",
                                )}
                                aria-hidden
                            >
                                <Check
                                    className={cn(
                                        "size-2.5 stroke-[3]",
                                        isOn ? "opacity-100" : "opacity-0",
                                    )}
                                />
                            </span>
                        </div>
                    );
                })}
            </div>

            {mode === "lead" ? (
                <div className="px-2.5 py-2 border-t border-border/50">
                    <Checkbox
                        isSelected={useBatch}
                        onChange={(checked: boolean) => setUseBatch(checked)}
                        isDisabled={isPending}
                    >
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                        <span className="text-xs text-muted">
                            Use OpenAI Batch API for all sources and combined summary (50% cheaper, within 24h)
                        </span>
                    </Checkbox>
                </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-t border-border/50 bg-surface-secondary/35">
                <p className="text-[10px] text-muted tabular-nums">
                    {selected.length}/{sourceOptions.length}
                </p>
                <div className="flex items-center gap-1.5">
                    <ActionButtonWithPending
                        size="sm"
                        variant="tertiary"
                        onPress={onCancel}
                        isDisabled={isPending}
                        idleLeading={<X className="size-3.5" />}
                    >
                        Cancel
                    </ActionButtonWithPending>
                    <ActionButtonWithPending
                        size="sm"
                        variant="secondary"
                        isDisabled={isPending || selected.length === 0}
                        isPending={isPending}
                        onPress={handleConfirm}
                        idleLeading={<Sparkles className="size-3.5" />}
                    >
                        Enrich
                    </ActionButtonWithPending>
                </div>
            </div>
        </>
    );
}

export function EnrichmentRunModal({
    isOpen,
    onOpenChange,
    mode,
    initialSources,
    sourceOptions,
    isPending,
    onEnrich,
    contextHint,
}: EnrichmentRunModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog
                    className={cn(
                        "outline-none p-0 overflow-hidden rounded-xl w-[min(100vw-1.25rem,20rem)]",
                        "border border-border/90 bg-overlay/95 backdrop-blur-md",
                        "shadow-[0_24px_48px_-12px_oklch(0_0_0/0.45),0_0_0_1px_oklch(1_0_0/0.04)_inset]",
                    )}
                >
                    <Modal.CloseTrigger className="top-2 end-2" />
                    <EnrichmentRunPanel
                        isActive={isOpen}
                        mode={mode}
                        initialSources={initialSources}
                        sourceOptions={sourceOptions}
                        isPending={isPending}
                        contextHint={contextHint}
                        onCancel={() => onOpenChange(false)}
                        onConfirm={(sources, options) => {
                            onEnrich(sources, options);
                            onOpenChange(false);
                        }}
                    />
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

export function EnrichmentActionPopover({
    mode,
    initialSources,
    sourceOptions,
    isPending,
    onEnrich,
    placement = "bottom end",
    triggerSize = "sm",
    triggerVariant = "tertiary",
}: EnrichmentActionPopoverProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover isOpen={open} onOpenChange={setOpen}>
            <Popover.Trigger>
                <ActionButtonWithPending
                    size={triggerSize}
                    variant={triggerVariant}
                    isDisabled={isPending}
                    isPending={isPending}
                    idleLeading={<Sparkles className="size-3.5" />}
                >
                    Enrich
                </ActionButtonWithPending>
            </Popover.Trigger>
            <Popover.Content
                placement={placement}
                className={cn(
                    "w-[min(100vw-1.25rem,20rem)] p-0 overflow-hidden rounded-xl",
                    "border border-border/90 bg-overlay/95 backdrop-blur-md",
                    "shadow-[0_24px_48px_-12px_oklch(0_0_0/0.45),0_0_0_1px_oklch(1_0_0/0.04)_inset]",
                )}
            >
                <Popover.Dialog className="outline-none">
                    <EnrichmentRunPanel
                        isActive={open}
                        mode={mode}
                        initialSources={initialSources}
                        sourceOptions={sourceOptions}
                        isPending={isPending}
                        onCancel={() => setOpen(false)}
                        onConfirm={(sources, options) => {
                            onEnrich(sources, options);
                            setOpen(false);
                        }}
                    />
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
