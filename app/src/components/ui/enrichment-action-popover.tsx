import { useEffect, useMemo, useState } from "react";
import { Button, Popover } from "@heroui/react";
import {
    Briefcase,
    Check,
    Globe,
    Search,
    Sparkles,
    X,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DEFAULT_ENRICHMENT_SOURCES,
    ENRICHMENT_SOURCE_OPTIONS,
    EnrichmentSource as EnrichmentSourceEnum,
    type EnrichmentSource,
} from "@/features/filters/constants/enrichment-sources";

export type EnrichmentActionMode = "contact" | "lead";

export interface EnrichmentActionPopoverProps {
    mode: EnrichmentActionMode;
    initialSources?: EnrichmentSource[];
    isPending: boolean;
    onEnrich: (sources: EnrichmentSource[]) => void;
    placement?: "bottom start" | "bottom end" | "top start" | "top end";
    triggerSize?: "sm" | "md" | "lg";
    triggerVariant?: "primary" | "secondary" | "tertiary";
}

const SOURCE_META: Record<
    EnrichmentSource,
    { icon: LucideIcon; hint: string; iconWrap: string }
> = {
    [EnrichmentSourceEnum.LINKEDIN]: {
        icon: Briefcase,
        hint: "Profile & org",
        iconWrap: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/25",
    },
    [EnrichmentSourceEnum.WEBSITE]: {
        icon: Globe,
        hint: "Site content",
        iconWrap: "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
    },
    [EnrichmentSourceEnum.GOOGLE_SEARCH]: {
        icon: Search,
        hint: "Web discovery",
        iconWrap:
            "bg-orange-500/28 text-orange-50 ring-1 ring-orange-300/50 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]",
    },
    [EnrichmentSourceEnum.AI]: {
        icon: Sparkles,
        hint: "AI summary",
        iconWrap: "bg-accent/18 text-accent ring-1 ring-accent/35",
    },
};

function baselineSources(
    mode: EnrichmentActionMode,
    initialSources: EnrichmentSource[] | undefined,
): EnrichmentSource[] {
    if (initialSources !== undefined) {
        return initialSources;
    }
    return mode === "lead" ? DEFAULT_ENRICHMENT_SOURCES : [];
}

export function EnrichmentActionPopover({
    mode,
    initialSources,
    isPending,
    onEnrich,
    placement = "bottom end",
    triggerSize = "sm",
    triggerVariant = "tertiary",
}: EnrichmentActionPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<EnrichmentSource[]>([]);

    const baseline = useMemo(
        () => baselineSources(mode, initialSources),
        [mode, initialSources],
    );

    useEffect(() => {
        if (open) {
            setSelected(baseline);
        }
    }, [open, baseline]);

    const toggleSource = (id: EnrichmentSource) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    };

    const handleEnrich = () => {
        if (selected.length === 0) return;
        onEnrich(selected);
        setOpen(false);
    };

    return (
        <Popover isOpen={open} onOpenChange={setOpen}>
            <Popover.Trigger>
                <Button
                    size={triggerSize}
                    variant={triggerVariant}
                    isDisabled={isPending}
                    isPending={isPending}
                >
                    <Sparkles className="size-3.5" />
                    Enrich
                </Button>
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
                                <Popover.Heading className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                                    Run enrichment
                                </Popover.Heading>
                                <p className="text-[11px] text-muted leading-snug mt-0.5">
                                    Pick sources; we queue one job per run.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-2.5 py-2 space-y-1">
                        {ENRICHMENT_SOURCE_OPTIONS.map((opt) => {
                            const meta = SOURCE_META[opt.id];
                            const Icon = meta.icon;
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

                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 border-t border-border/50 bg-surface-secondary/35">
                        <p className="text-[10px] text-muted tabular-nums">
                            {selected.length}/{ENRICHMENT_SOURCE_OPTIONS.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                size="sm"
                                variant="tertiary"
                                onPress={() => setOpen(false)}
                                isDisabled={isPending}
                            >
                                <X className="size-3.5" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                isDisabled={isPending || selected.length === 0}
                                isPending={isPending}
                                onPress={handleEnrich}
                            >
                                <Sparkles className="size-3.5" />
                                Enrich
                            </Button>
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
