import { Button } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterRunLeadingVisual({
    isStarting,
    isJobRunning,
    iconClassName,
}: {
    isStarting: boolean;
    isJobRunning: boolean;
    iconClassName?: string;
}) {
    const busy = isStarting || isJobRunning;
    const cls = cn("shrink-0", iconClassName);
    if (!busy) {
        return <Play className={cls} />;
    }
    return <Spinner size="sm" color="current" className={cls} />;
}

export function FilterRunButton({
    onPress,
    isStarting,
    isJobRunning,
    isManual,
    filterEnabled,
}: {
    onPress: () => void;
    isStarting: boolean;
    isJobRunning: boolean;
    isManual: boolean;
    filterEnabled: boolean;
}) {
    const busy = isStarting || isJobRunning;
    const disabled = busy || isManual || !filterEnabled;

    const labelWide = isManual
        ? "Can't run"
        : !busy
          ? "Run Now"
          : isJobRunning
            ? "Running…"
            : "Starting…";

    const labelNarrow = isManual
        ? "—"
        : !busy
          ? "Run"
          : isJobRunning
            ? "Live"
            : "…";

    return (
        <Button
            size="sm"
            isDisabled={disabled}
            onPress={onPress}
            aria-busy={busy}
            aria-label={
                isManual
                    ? "Manual filters cannot be run"
                    : busy
                      ? "Filter run in progress"
                      : "Run filter now"
            }
            className={cn(
                "min-h-8 transition-[color,background-color,border-color,box-shadow]",
                isJobRunning &&
                    "border-warning/35 bg-warning/[0.08] text-warning shadow-[inset_0_0_0_1px] shadow-warning/20",
                isStarting &&
                    !isJobRunning &&
                    "border-accent/30 bg-accent/[0.06] text-accent shadow-[inset_0_0_0_1px] shadow-accent/15",
            )}
        >
            <FilterRunLeadingVisual
                isStarting={isStarting}
                isJobRunning={isJobRunning}
                iconClassName="size-3.5"
            />
            <span className="hidden @[18rem]:inline tabular-nums">{labelWide}</span>
            <span className="@[18rem]:hidden tabular-nums">{labelNarrow}</span>
        </Button>
    );
}
