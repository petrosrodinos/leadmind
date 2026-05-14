import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCampaignDraftMessages } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type { DraftMessage } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignContactStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";

interface DraftedMessagesTableProps {
    campaignUuid: string;
}

function DraftedMessagesTableSkeleton() {
    return (
        <div className="rounded-xl border border-border overflow-hidden animate-pulse">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-surface-secondary/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Subject / Preview</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 w-10" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 space-y-2">
                                <div className="h-4 w-36 rounded bg-surface-secondary" />
                                <div className="h-3 w-28 rounded bg-surface-secondary" />
                            </td>
                            <td className="px-4 py-3 space-y-2 max-w-xs">
                                <div className="h-4 w-full rounded bg-surface-secondary" />
                                <div className="h-3 w-3/4 max-w-full rounded bg-surface-secondary" />
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-6 w-20 rounded-full bg-surface-secondary" />
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-4 w-4 rounded bg-surface-secondary mx-auto" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function DraftedMessagesTable({ campaignUuid }: DraftedMessagesTableProps) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useCampaignDraftMessages(campaignUuid, { page, limit: 20 });

    if (isLoading) {
        return <DraftedMessagesTableSkeleton />;
    }

    if (!data || data.data.length === 0) {
        return <div className="text-sm text-muted py-8 text-center">No drafted messages found.</div>;
    }

    return (
        <div className="space-y-2">
            <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-secondary/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Subject / Preview</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((msg) => (
                            <DraftRow key={msg.uuid} msg={msg} />
                        ))}
                    </tbody>
                </table>
            </div>

            {data.totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>Page {data.page} of {data.totalPages} · {data.total} drafts</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" isDisabled={page <= 1} onPress={() => setPage((p) => p - 1)}>
                            Previous
                        </Button>
                        <Button size="sm" variant="ghost" isDisabled={page >= data.totalPages} onPress={() => setPage((p) => p + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DraftRow({ msg }: { msg: DraftMessage }) {
    const [expanded, setExpanded] = useState(false);
    const contactName = msg.contact.name || msg.contact.email || msg.contact.phone || msg.contact_uuid.slice(0, 8);
    const preview = stripHtml(msg.content).slice(0, 120);

    return (
        <>
            <tr
                className="border-b border-border last:border-0 hover:bg-surface-secondary/30 cursor-pointer"
                onClick={() => setExpanded((v) => !v)}
            >
                <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{contactName}</div>
                    {msg.contact.company && (
                        <div className="text-xs text-muted">{msg.contact.company}</div>
                    )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                    {msg.subject && (
                        <div className="font-medium text-foreground truncate">{msg.subject}</div>
                    )}
                    <div className="text-muted truncate">{preview}…</div>
                </td>
                <td className="px-4 py-3">
                    <StatusChip status={msg.status} />
                </td>
                <td className="px-4 py-3">
                    {expanded ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                </td>
            </tr>
            {expanded && (
                <tr className="border-b border-border last:border-0 bg-surface-secondary/20">
                    <td colSpan={4} className="px-4 py-4">
                        {msg.subject && (
                            <div className="mb-2">
                                <span className="text-xs text-muted uppercase tracking-wide">Subject</span>
                                <div className="font-medium text-foreground">{msg.subject}</div>
                            </div>
                        )}
                        <div className="text-xs text-muted uppercase tracking-wide mb-1">Message</div>
                        <div
                            className="prose prose-sm max-w-none text-sm"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: msg.content }}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}

function StatusChip({ status }: { status: string }) {
    const color =
        status === CampaignContactStatuses.PENDING ? "default" :
        status === CampaignContactStatuses.SENT || status === CampaignContactStatuses.DELIVERED ? "success" :
        status === CampaignContactStatuses.FAILED ? "danger" :
        status === CampaignContactStatuses.OPENED || status === CampaignContactStatuses.CLICKED ? "accent" :
        "default";
    return (
        <Chip size="sm" variant="soft" color={color as any}>
            <Chip.Label>{status}</Chip.Label>
        </Chip>
    );
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
