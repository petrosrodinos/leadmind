import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { key: "basics", label: "Basics" },
    { key: "audience", label: "Audience" },
    { key: "message", label: "Message" },
    { key: "review", label: "Review" },
] as const;

export type WizardStepKey = (typeof STEPS)[number]["key"];

interface WizardShellProps {
    activeStep: WizardStepKey;
    onSelect: (step: WizardStepKey) => void;
    children: React.ReactNode;
}

export function WizardShell({ activeStep, onSelect, children }: WizardShellProps) {
    const activeIndex = STEPS.findIndex((s) => s.key === activeStep);
    return (
        <div className="flex flex-col gap-6">
            <ol className="flex items-center gap-2 flex-wrap">
                {STEPS.map((step, idx) => {
                    const isDone = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    return (
                        <li key={step.key} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onSelect(step.key)}
                                className={cn(
                                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                                    isActive
                                        ? "border-accent bg-accent/10 text-accent"
                                        : isDone
                                          ? "border-success/30 bg-success/10 text-success hover:border-success/60"
                                          : "border-border text-muted hover:text-foreground",
                                )}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="size-4" />
                                ) : (
                                    <span
                                        className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                                            isActive
                                                ? "bg-accent text-white"
                                                : "bg-surface-secondary text-muted",
                                        )}
                                    >
                                        {idx + 1}
                                    </span>
                                )}
                                <span>{step.label}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <span className="text-muted">›</span>
                            )}
                        </li>
                    );
                })}
            </ol>
            <div>{children}</div>
        </div>
    );
}

export const WIZARD_STEPS = STEPS;
