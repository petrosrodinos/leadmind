import React, { useMemo } from "react";
import { Chip } from "@heroui/react";
import {
    ArrowRight,
    CalendarDays,
    ExternalLink,
    Mail,
    MailOpen,
    Megaphone,
    MessageCircleReply,
    MessageSquare,
    MousePointerClick,
    Phone,
    StickyNote,
    UserMinus,
    XCircle,
    Globe,
    CalendarClock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    CallDirection,
    CallOutcome,
    InteractionType,
    type CallMetadata,
    type Interaction,
    type InteractionStatusChange,
    type MeetingMetadata,
    type MessageMetadata,
} from "@/features/contacts/interfaces/contact.interface";
import { isLeadStatus } from "@/features/contacts/constants/contacts.constants";
import { useContactInteractions } from "@/features/contacts/hooks/use-contacts";
import { StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import { cn } from "@/lib/utils";

const ICONS: Record<InteractionType, React.ComponentType<{ className?: string }>> = {
    [InteractionType.EMAIL]: Mail,
    [InteractionType.SMS]: MessageSquare,
    [InteractionType.CALL]: Phone,
    [InteractionType.NOTE]: StickyNote,
    [InteractionType.MEETING]: CalendarDays,
    [InteractionType.STATUS_CHANGE]: ArrowRight,
    [InteractionType.CAMPAIGN_EMAIL_SENT]: Megaphone,
    [InteractionType.CAMPAIGN_SMS_SENT]: Megaphone,
    [InteractionType.EMAIL_DELIVERED]: Mail,
    [InteractionType.SMS_DELIVERED]: Megaphone,
    [InteractionType.EMAIL_OPENED]: MailOpen,
    [InteractionType.LINK_CLICKED]: MousePointerClick,
    [InteractionType.WEBSITE_VISIT]: Globe,
    [InteractionType.BOOKING_VISIT]: CalendarClock,
    [InteractionType.REPLY_RECEIVED]: MessageCircleReply,
    [InteractionType.EMAIL_BOUNCED]: XCircle,
    [InteractionType.EMAIL_FAILED]: XCircle,
    [InteractionType.SMS_FAILED]: XCircle,
    [InteractionType.UNSUBSCRIBED]: UserMinus,
};

const ICON_TONE: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.SMS]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.CALL]: "text-fuchsia-600 bg-fuchsia-500/15 border-fuchsia-500/30",
    [InteractionType.NOTE]: "text-muted bg-surface-secondary border-border",
    [InteractionType.MEETING]: "text-emerald-600 bg-emerald-500/15 border-emerald-500/30",
    [InteractionType.STATUS_CHANGE]: "text-warning bg-warning-soft/40 border-warning/30",
    [InteractionType.CAMPAIGN_EMAIL_SENT]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.CAMPAIGN_SMS_SENT]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.EMAIL_DELIVERED]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.SMS_DELIVERED]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.EMAIL_OPENED]: "text-success bg-success/10 border-success/30",
    [InteractionType.LINK_CLICKED]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.WEBSITE_VISIT]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.BOOKING_VISIT]: "text-accent bg-accent/15 border-accent/30",
    [InteractionType.REPLY_RECEIVED]: "text-success bg-success/10 border-success/30",
    [InteractionType.EMAIL_BOUNCED]: "text-danger bg-danger/10 border-danger/30",
    [InteractionType.EMAIL_FAILED]: "text-danger bg-danger/10 border-danger/30",
    [InteractionType.SMS_FAILED]: "text-danger bg-danger/10 border-danger/30",
    [InteractionType.UNSUBSCRIBED]: "text-warning bg-warning-soft/40 border-warning/30",
};

const BADGE_COLOR: Record<InteractionType, "default" | "success" | "warning" | "danger"> = {
    [InteractionType.EMAIL]: "success",
    [InteractionType.SMS]: "success",
    [InteractionType.CALL]: "warning",
    [InteractionType.NOTE]: "default",
    [InteractionType.MEETING]: "success",
    [InteractionType.STATUS_CHANGE]: "warning",
    [InteractionType.CAMPAIGN_EMAIL_SENT]: "success",
    [InteractionType.CAMPAIGN_SMS_SENT]: "success",
    [InteractionType.EMAIL_DELIVERED]: "success",
    [InteractionType.SMS_DELIVERED]: "success",
    [InteractionType.EMAIL_OPENED]: "success",
    [InteractionType.LINK_CLICKED]: "success",
    [InteractionType.WEBSITE_VISIT]: "success",
    [InteractionType.BOOKING_VISIT]: "success",
    [InteractionType.REPLY_RECEIVED]: "success",
    [InteractionType.EMAIL_BOUNCED]: "danger",
    [InteractionType.EMAIL_FAILED]: "danger",
    [InteractionType.SMS_FAILED]: "danger",
    [InteractionType.UNSUBSCRIBED]: "warning",
};

const BADGE_LABEL: Record<InteractionType, string> = {
    [InteractionType.EMAIL]: "Email",
    [InteractionType.SMS]: "SMS",
    [InteractionType.CALL]: "Call",
    [InteractionType.NOTE]: "Note",
    [InteractionType.MEETING]: "Meeting",
    [InteractionType.STATUS_CHANGE]: "Status change",
    [InteractionType.CAMPAIGN_EMAIL_SENT]: "Campaign email",
    [InteractionType.CAMPAIGN_SMS_SENT]: "Campaign SMS",
    [InteractionType.EMAIL_DELIVERED]: "Email delivered",
    [InteractionType.SMS_DELIVERED]: "SMS delivered",
    [InteractionType.EMAIL_OPENED]: "Email opened",
    [InteractionType.LINK_CLICKED]: "Link clicked",
    [InteractionType.WEBSITE_VISIT]: "Website visit",
    [InteractionType.BOOKING_VISIT]: "Booking visit",
    [InteractionType.REPLY_RECEIVED]: "Reply received",
    [InteractionType.EMAIL_BOUNCED]: "Email bounced",
    [InteractionType.EMAIL_FAILED]: "Email failed",
    [InteractionType.SMS_FAILED]: "SMS failed",
    [InteractionType.UNSUBSCRIBED]: "Unsubscribed",
};

const CALL_OUTCOME_LABEL: Record<CallOutcome, string> = {
    [CallOutcome.CONNECTED]: "Connected",
    [CallOutcome.NO_ANSWER]: "No answer",
    [CallOutcome.VOICEMAIL]: "Voicemail",
    [CallOutcome.BUSY]: "Busy",
};

const CALL_OUTCOME_COLOR: Record<CallOutcome, "default" | "success" | "warning" | "danger"> = {
    [CallOutcome.CONNECTED]: "success",
    [CallOutcome.VOICEMAIL]: "warning",
    [CallOutcome.NO_ANSWER]: "default",
    [CallOutcome.BUSY]: "default",
};

const CALL_DIRECTION_LABEL: Record<CallDirection, string> = {
    [CallDirection.OUTBOUND]: "Outbound",
    [CallDirection.INBOUND]: "Inbound",
};

function isCallOutcome(v: unknown): v is CallOutcome {
    return typeof v === "string" && (Object.values(CallOutcome) as string[]).includes(v);
}

function isCallDirection(v: unknown): v is CallDirection {
    return typeof v === "string" && (Object.values(CallDirection) as string[]).includes(v);
}

function parseCallMetadata(raw: Interaction["metadata"]): CallMetadata | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (!isCallOutcome(o.outcome) || !isCallDirection(o.direction)) return null;
    const meta: CallMetadata = { outcome: o.outcome, direction: o.direction };
    if (typeof o.duration_minutes === "number") meta.duration_minutes = o.duration_minutes;
    if (typeof o.occurred_at === "string") meta.occurred_at = o.occurred_at;
    return meta;
}

function parseMeetingMetadata(raw: Interaction["metadata"]): MeetingMetadata | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (typeof o.occurred_at !== "string") return null;
    const meta: MeetingMetadata = { occurred_at: o.occurred_at };
    if (typeof o.duration_minutes === "number") meta.duration_minutes = o.duration_minutes;
    if (typeof o.location === "string") meta.location = o.location;
    return meta;
}

function parseMessageMetadata(raw: Interaction["metadata"]): MessageMetadata | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (!isCallDirection(o.direction)) return null;
    const meta: MessageMetadata = { direction: o.direction };
    if (typeof o.subject === "string") meta.subject = o.subject;
    if (typeof o.occurred_at === "string") meta.occurred_at = o.occurred_at;
    return meta;
}

function formatOccurredAt(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}


function parseStatusChange(raw: Interaction["status_change"]): InteractionStatusChange | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as unknown as Record<string, unknown>;
    const from = o.from;
    const to = o.to;
    if (typeof from !== "string" || typeof to !== "string") return null;
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
                const callMeta =
                    interaction.type === InteractionType.CALL
                        ? parseCallMetadata(interaction.metadata)
                        : null;
                const meetingMeta =
                    interaction.type === InteractionType.MEETING
                        ? parseMeetingMetadata(interaction.metadata)
                        : null;
                const messageMeta =
                    (interaction.type === InteractionType.EMAIL ||
                        interaction.type === InteractionType.SMS) &&
                    !interaction.outreach_message
                        ? parseMessageMetadata(interaction.metadata)
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
                            ) : callMeta ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted">
                                        <Chip size="sm" variant="soft" color={CALL_OUTCOME_COLOR[callMeta.outcome]}>
                                            <Chip.Label>{CALL_OUTCOME_LABEL[callMeta.outcome]}</Chip.Label>
                                        </Chip>
                                        <Chip size="sm" variant="soft" color="default">
                                            <Chip.Label>{CALL_DIRECTION_LABEL[callMeta.direction]}</Chip.Label>
                                        </Chip>
                                        {callMeta.duration_minutes !== undefined ? (
                                            <span>· {callMeta.duration_minutes} min</span>
                                        ) : null}
                                    </div>
                                    {interaction.content?.trim() ? (
                                        <p className="text-sm text-foreground whitespace-pre-line break-words mt-2">
                                            {interaction.content}
                                        </p>
                                    ) : null}
                                </>
                            ) : meetingMeta ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-foreground">
                                        <span className="font-medium">{formatOccurredAt(meetingMeta.occurred_at)}</span>
                                        {meetingMeta.duration_minutes !== undefined ? (
                                            <span className="text-xs text-muted">· {meetingMeta.duration_minutes} min</span>
                                        ) : null}
                                    </div>
                                    {meetingMeta.location ? (
                                        <p className="text-xs text-muted mt-1 break-words">{meetingMeta.location}</p>
                                    ) : null}
                                    {interaction.content?.trim() ? (
                                        <p className="text-sm text-foreground whitespace-pre-line break-words mt-2">
                                            {interaction.content}
                                        </p>
                                    ) : null}
                                </>
                            ) : messageMeta ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted">
                                        <Chip size="sm" variant="soft" color="default">
                                            <Chip.Label>{CALL_DIRECTION_LABEL[messageMeta.direction]}</Chip.Label>
                                        </Chip>
                                        {messageMeta.occurred_at ? (
                                            <span>{formatOccurredAt(messageMeta.occurred_at)}</span>
                                        ) : null}
                                    </div>
                                    {messageMeta.subject ? (
                                        <p className="text-sm font-medium text-foreground mt-2 break-words">
                                            {messageMeta.subject}
                                        </p>
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
