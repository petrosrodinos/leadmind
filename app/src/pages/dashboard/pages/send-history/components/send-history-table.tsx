import { Chip } from "@heroui/react";
import { Link } from "react-router-dom";
import type { MsgStatus } from "@/features/contacts/interfaces/contact.interface";
import type { SendHistoryMessage } from "@/features/outreach/interfaces/send-history.interface";
import { Routes } from "@/routes/routes";
import {
    formatSendHistoryDate,
    getContactDestination,
    getSendIntegrationLabel,
} from "../utils/send-history.utils";

const STATUS_COLOR: Record<
    MsgStatus,
    "default" | "accent" | "success" | "warning" | "danger"
> = {
    PENDING: "default",
    QUEUED: "default",
    SENT: "accent",
    FAILED: "danger",
    DELIVERED: "success",
    OPENED: "success",
    CLICKED: "success",
    REPLIED: "success",
    BOUNCED: "danger",
    UNSUBSCRIBED: "warning",
    SKIPPED: "default",
};

export function SendHistoryTable({ rows }: { rows: SendHistoryMessage[] }) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-8 text-center text-sm text-muted">
                No sends match your filters.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead className="bg-surface-secondary/40 text-muted">
                    <tr>
                        <th className="px-3 py-2 text-left font-medium">Contact</th>
                        <th className="px-3 py-2 text-left font-medium">Channel</th>
                        <th className="px-3 py-2 text-left font-medium">Integration</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-left font-medium">Subject / preview</th>
                        <th className="px-3 py-2 text-left font-medium">Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.uuid} className="border-t border-border">
                            <td className="px-3 py-2 align-top">
                                <Link
                                    to={Routes.dashboard.contacts_detail.replace(
                                        ":uuid",
                                        row.contact.uuid,
                                    )}
                                    className="font-medium text-foreground hover:text-accent"
                                >
                                    {row.contact.name ?? "Unnamed contact"}
                                </Link>
                                <div className="text-xs text-muted">{getContactDestination(row)}</div>
                            </td>
                            <td className="px-3 py-2 align-top text-foreground/90">{row.channel}</td>
                            <td className="px-3 py-2 align-top text-foreground/90">
                                {getSendIntegrationLabel(row)}
                            </td>
                            <td className="px-3 py-2 align-top">
                                <Chip size="sm" variant="soft" color={STATUS_COLOR[row.status]}>
                                    <Chip.Label>{row.status}</Chip.Label>
                                </Chip>
                            </td>
                            <td className="px-3 py-2 align-top max-w-xs">
                                {row.channel === "EMAIL" && row.subject ? (
                                    <div className="font-medium text-foreground truncate">
                                        {row.subject}
                                    </div>
                                ) : null}
                                <div className="text-xs text-muted line-clamp-2">
                                    {stripHtml(row.content)}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-top text-xs text-muted whitespace-nowrap">
                                {formatSendHistoryDate(row.sent_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
