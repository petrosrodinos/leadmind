import {
    CallOutcome,
    MeetingOutcome,
} from "@/features/contacts/interfaces/contact.interface";
import type { ContactAudienceStats } from "@/features/contact-audience-stats/interfaces/contact-audience-stats.interface";
import { formatAudienceRate } from "@/features/contact-audience-stats/utils/audience-stats.utils";

interface StatTile {
    label: string;
    value: number;
    sublabel?: string;
    accent?: "neutral" | "primary" | "success" | "warning" | "error";
}

interface StatSection {
    title: string;
    tiles: StatTile[];
}

const MEETING_OUTCOME_LABELS: Record<MeetingOutcome, string> = {
    [MeetingOutcome.SCHEDULED]: "Scheduled",
    [MeetingOutcome.COMPLETED]: "Completed",
    [MeetingOutcome.NO_SHOW]: "No show",
    [MeetingOutcome.CANCELLED]: "Cancelled",
    [MeetingOutcome.CLOSED_WON]: "Closed won",
    [MeetingOutcome.CLOSED_LOST]: "Closed lost",
};

const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
    [CallOutcome.CONNECTED]: "Connected",
    [CallOutcome.NO_ANSWER]: "No answer",
    [CallOutcome.VOICEMAIL]: "Voicemail",
    [CallOutcome.BUSY]: "Busy",
};

function buildSections(stats: ContactAudienceStats): StatSection[] {
    const { pipeline, meetings, calls, engagement, activity } = stats;

    const sections: StatSection[] = [
        {
            title: "Pipeline",
            tiles: [
                { label: "Total contacts", value: pipeline.total_contacts, accent: "neutral" },
                { label: "Active pipeline", value: pipeline.active_pipeline, accent: "primary" },
                {
                    label: "Conversion rate",
                    value: pipeline.conversion_rate,
                    sublabel: formatAudienceRate(pipeline.conversion_rate),
                    accent: "success",
                },
                {
                    label: "Close rate",
                    value: pipeline.close_rate,
                    sublabel: formatAudienceRate(pipeline.close_rate),
                    accent: "success",
                },
                {
                    label: "Loss rate",
                    value: pipeline.loss_rate,
                    sublabel: formatAudienceRate(pipeline.loss_rate),
                    accent: "error",
                },
                {
                    label: "Converted",
                    value: pipeline.by_status.CONVERTED ?? 0,
                    accent: "success",
                },
                {
                    label: "Lost",
                    value: pipeline.by_status.LOST ?? 0,
                    accent: "error",
                },
            ],
        },
        {
            title: "Meetings",
            tiles: [
                { label: "Total meetings", value: meetings.total, accent: "primary" },
                {
                    label: "Contacts with meetings",
                    value: meetings.contacts_with_meetings,
                    accent: "neutral",
                },
                {
                    label: "No-show rate",
                    value: meetings.no_show_rate ?? 0,
                    sublabel: formatAudienceRate(meetings.no_show_rate),
                    accent: "warning",
                },
                {
                    label: "Meeting close rate",
                    value: meetings.meeting_close_rate ?? 0,
                    sublabel: formatAudienceRate(meetings.meeting_close_rate),
                    accent: "success",
                },
                ...Object.values(MeetingOutcome).map((outcome) => ({
                    label: MEETING_OUTCOME_LABELS[outcome],
                    value: meetings.by_outcome[outcome] ?? 0,
                    accent: "neutral" as const,
                })),
            ],
        },
        {
            title: "Calls",
            tiles: [
                { label: "Total calls", value: calls.total, accent: "primary" },
                {
                    label: "Connect rate",
                    value: calls.connect_rate ?? 0,
                    sublabel: formatAudienceRate(calls.connect_rate),
                    accent: "success",
                },
                ...Object.values(CallOutcome).map((outcome) => ({
                    label: CALL_OUTCOME_LABELS[outcome],
                    value: calls.by_outcome[outcome] ?? 0,
                    accent: "neutral" as const,
                })),
            ],
        },
        {
            title: "Engagement",
            tiles: [
                { label: "With email", value: engagement.with_email, accent: "neutral" },
                { label: "With phone", value: engagement.with_phone, accent: "neutral" },
                { label: "Never contacted", value: engagement.never_contacted, accent: "warning" },
                { label: "Emails opened", value: engagement.emails_opened, accent: "success" },
                { label: "Links clicked", value: engagement.links_clicked, accent: "success" },
                { label: "Replies", value: engagement.replies_received, accent: "success" },
                { label: "Website visits", value: engagement.website_visits, accent: "primary" },
                { label: "Booking visits", value: engagement.booking_visits, accent: "primary" },
            ],
        },
        {
            title: "Activity",
            tiles: [
                { label: "Total interactions", value: activity.total_interactions, accent: "neutral" },
                { label: "Notes", value: activity.notes, accent: "neutral" },
                { label: "Status changes", value: activity.status_changes, accent: "primary" },
            ],
        },
    ];

    return sections;
}

interface AudienceStatsSectionsProps {
    stats: ContactAudienceStats | undefined;
    isLoading: boolean;
}

export function AudienceStatsSections({ stats, isLoading }: AudienceStatsSectionsProps) {
    if (isLoading) {
        return (
            <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <section key={i} className="space-y-2">
                        <div className="h-3 w-24 rounded bg-surface-secondary animate-pulse" />
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="rounded-xl border border-border bg-surface p-3 h-[72px] animate-pulse"
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const sections = buildSections(stats);

    return (
        <div className="space-y-5">
            {sections.map((section) => (
                <section key={section.title} className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {section.title}
                    </h2>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {section.tiles.map((tile) => (
                            <Tile key={`${section.title}-${tile.label}`} {...tile} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function Tile({ label, value, sublabel, accent = "neutral" }: StatTile) {
    const tone =
        accent === "primary"
            ? "text-accent"
            : accent === "success"
              ? "text-success"
              : accent === "warning"
                ? "text-warning"
                : accent === "error"
                  ? "text-error"
                  : "text-foreground";

    const displayValue =
        label.includes("rate") && sublabel ? sublabel.replace("%", "") : value.toLocaleString();

    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-muted">{label}</div>
            <div className={`text-2xl font-semibold tabular-nums ${tone}`}>
                {label.includes("rate") && sublabel ? sublabel : displayValue}
            </div>
            {sublabel && !label.includes("rate") ? (
                <div className="text-xs text-muted mt-0.5 tabular-nums">{sublabel}</div>
            ) : null}
        </div>
    );
}
