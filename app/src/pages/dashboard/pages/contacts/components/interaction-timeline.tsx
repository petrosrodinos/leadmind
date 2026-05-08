import { useMemo } from "react";
import { Chip } from "@heroui/react";
import { ArrowRight, Mail, Phone, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    InteractionType,
    type Interaction,
} from "@/features/contacts/interfaces/contact.interface";
import { useContactInteractions } from "@/features/contacts/hooks/use-contacts";
import { cn } from "@/lib/utils";

const ICONS = {
    [InteractionType.EMAIL]: Mail,
    [InteractionType.CALL]: Phone,
    [InteractionType.NOTE]: StickyNote,
} as const;

const ICON_TONE: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.CALL]: "text-fuchsia-600 bg-fuchsia-500/15 border-fuchsia-500/30",
    [InteractionType.NOTE]: "text-muted bg-surface-secondary border-border",
};

const STATUS_CHANGE_ICON_TONE =
    "text-warning bg-warning-soft/40 border-warning/30";

const BADGE_COLOR: Record<
    InteractionType,
    "default" | "success" | "warning" | "danger"
> = {
    [InteractionType.EMAIL]: "success",
    [InteractionType.CALL]: "warning",
    [InteractionType.NOTE]: "default",
};

const BADGE_LABEL: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "Email",
    [InteractionType.CALL]: "Call",
    [InteractionType.NOTE]: "Note",
};

const isStatusChangeNote = (interaction: Interaction): boolean =>
    interaction.type === InteractionType.NOTE &&
    typeof interaction.content === "string" &&
    interaction.content.startsWith("Status changed from");

interface InteractionTimelineProps {
    contactUuid: string;
}

export function InteractionTimeline({ contactUuid }: InteractionTimelineProps) {
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
                const isStatusChange = isStatusChangeNote(interaction);
                const Icon = isStatusChange
                    ? ArrowRight
                    : ICONS[interaction.type] ?? StickyNote;
                const iconTone = isStatusChange
                    ? STATUS_CHANGE_ICON_TONE
                    : ICON_TONE[interaction.type] ?? ICON_TONE[InteractionType.NOTE];
                const isLast = idx === sorted.length - 1;
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
                            {!isLast && (
                                <span className="flex-1 w-px bg-border my-1" />
                            )}
                        </div>
                        <div
                            className={cn(
                                "min-w-0 flex-1 pt-1",
                                !isLast && "pb-4",
                            )}
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                {isStatusChange ? (
                                    <Chip size="sm" variant="soft" color="warning">
                                        <Chip.Label>Status change</Chip.Label>
                                    </Chip>
                                ) : (
                                    <Chip
                                        size="sm"
                                        variant="soft"
                                        color={BADGE_COLOR[interaction.type] ?? "default"}
                                    >
                                        <Chip.Label>
                                            {BADGE_LABEL[interaction.type] ?? interaction.type}
                                        </Chip.Label>
                                    </Chip>
                                )}
                                <span
                                    className="text-xs text-muted"
                                    title={new Date(interaction.created_at).toLocaleString()}
                                >
                                    {formatDistanceToNow(new Date(interaction.created_at), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                            {interaction.content && (
                                <p className="text-sm text-foreground whitespace-pre-line break-words mt-1">
                                    {interaction.content}
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
