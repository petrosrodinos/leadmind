import { useMemo } from "react";
import { Chip } from "@heroui/react";
import { ArrowRight, ExternalLink, Mail, Phone, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    InteractionType,
    LeadStatus,
    type Interaction,
    type InteractionStatusChange,
} from "@/features/contacts/interfaces/contact.interface";
import { useContactInteractions } from "@/features/contacts/hooks/use-contacts";
import { StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import { cn } from "@/lib/utils";

const ICONS = {
    [InteractionType.EMAIL]: Mail,
    [InteractionType.CALL]: Phone,
    [InteractionType.NOTE]: StickyNote,
    [InteractionType.STATUS_CHANGE]: ArrowRight,
} as const;

const ICON_TONE: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.CALL]: "text-fuchsia-600 bg-fuchsia-500/15 border-fuchsia-500/30",
    [InteractionType.NOTE]: "text-muted bg-surface-secondary border-border",
    [InteractionType.STATUS_CHANGE]:
        "text-warning bg-warning-soft/40 border-warning/30",
};

const BADGE_COLOR: Record<
    InteractionType,
    "default" | "success" | "warning" | "danger"
> = {
    [InteractionType.EMAIL]: "success",
    [InteractionType.CALL]: "warning",
    [InteractionType.NOTE]: "default",
    [InteractionType.STATUS_CHANGE]: "warning",
};

const BADGE_LABEL: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "Email",
    [InteractionType.CALL]: "Call",
    [InteractionType.NOTE]: "Note",
    [InteractionType.STATUS_CHANGE]: "Status change",
};

function isLeadStatus(v: unknown): v is LeadStatus {
    return typeof v === "string" && (Object.values(LeadStatus) as string[]).includes(v);
}

function parseStatusChange(raw: Interaction["status_change"]): InteractionStatusChange | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const from = o.from;
    const to = o.to;
    if (!isLeadStatus(from) || !isLeadStatus(to)) return null;
    return { from, to };
}

interface InteractionTimelineProps {
    contactUuid: string;
    onNavigateToOutreach?: (outreachUuid: string) => void;
}

export function InteractionTimeline({ contactUuid, onNavigateToOutreach }: InteractionTimelineProps) {
    const { data: interactions, isLoading } = useContactInteractions(contactUuid);

    const sorted = useMemo(() => {
        if (!interactions) return [];
        return [...interactions].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }, [interactions]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="size-8 rounded-full bg-surface-secondary animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 w-24 rounded bg-surface-secondary animate-pulse" />
                            <div className="h-4 w-2/3 rounded bg-surface-secondary animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-muted italic">
                No interactions yet. Notes, status changes, and sent messages will appear here.
            </p>
        );
    }

    return (
        <ol className="flex flex-col">
            {sorted.map((interaction, idx) => {
                const Icon = ICONS[interaction.type] ?? StickyNote;
                const iconTone = ICON_TONE[interaction.type] ?? ICON_TONE[InteractionType.NOTE];
                const isLast = idx === sorted.length - 1;
                const pair =
                    interaction.type === InteractionType.STATUS_CHANGE
                        ? parseStatusChange(interaction.status_change)
                        : null;

                return (
                    <li key={interaction.uuid} className="flex gap-3">
                        <div className="relative flex flex-col items-center shrink-0 w-8">
                            <span
                                className={cn(
                                    "relative z-10 inline-flex size-8 items-center justify-center rounded-full border",
                                    iconTone,
                                )}
                            >
                                <Icon className="size-4" />
                            </span>
                            {!isLast && <span className="flex-1 w-px bg-border my-1" />}
                        </div>
                        <div
                            className={cn(
                                "min-w-0 flex-1 pt-1",
                                !isLast && "pb-4",
                            )}
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color={BADGE_COLOR[interaction.type] ?? "default"}
                                >
                                    <Chip.Label>
                                        {BADGE_LABEL[interaction.type] ?? interaction.type}
                                    </Chip.Label>
                                </Chip>
                                <span
                                    className="text-xs text-muted"
                                    title={new Date(interaction.created_at).toLocaleString()}
                                >
                                    {formatDistanceToNow(new Date(interaction.created_at), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                            {interaction.type === InteractionType.STATUS_CHANGE ? (
                                <>
                                    {pair ? (
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <StatusChip status={pair.from} />
                                            <ArrowRight
                                                className="size-4 text-muted shrink-0"
                                                aria-hidden
                                            />
                                            <StatusChip status={pair.to} />
                                        </div>
                                    ) : null}
                                    {interaction.content?.trim() ? (
                                        <p className="text-sm text-foreground whitespace-pre-line break-words mt-2">
                                            {interaction.content}
                                        </p>
                                    ) : null}
                                </>
                            ) : interaction.outreach_message ? (
                                <button
                                    type="button"
                                    onClick={() => onNavigateToOutreach?.(interaction.outreach_message!.uuid)}
                                    className="group mt-1 inline-flex items-center gap-1.5 text-left text-sm font-medium text-foreground hover:text-accent transition-colors"
                                    title="Open in Outreach tab"
                                >
                                    <span className="truncate">
                                        {interaction.outreach_message.subject?.trim() || "(no subject)"}
                                    </span>
                                    <ExternalLink className="size-3.5 text-muted group-hover:text-accent shrink-0" />
                                </button>
                            ) : interaction.content?.trim() ? (
                                <p className="text-sm text-foreground whitespace-pre-line break-words mt-1">
                                    {interaction.content}
                                </p>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
