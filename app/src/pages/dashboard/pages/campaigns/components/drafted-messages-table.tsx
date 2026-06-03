import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Check, ChevronDown, ChevronUp, Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCampaignDraftMessages, useDeleteCampaignDraftMessage } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type { DraftMessage } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignContactStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { MsgStatus } from "@/features/contacts/interfaces/contact.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditCampaignDraftMessageModal } from "./edit-campaign-draft-message-modal";

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
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide w-28">Actions</th>
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
                                <div className="h-8 w-20 rounded bg-surface-secondary ms-auto" />
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
    const [editMsg, setEditMsg] = useState<DraftMessage | null>(null);
    const [deleteMsg, setDeleteMsg] = useState<DraftMessage | null>(null);
    const deleteMu = useDeleteCampaignDraftMessage();

    if (isLoading) {
        return <DraftedMessagesTableSkeleton />;
    }

    if (!data || data.data.length === 0) {
        return <div className="text-sm text-muted py-8 text-center">No drafted messages found.</div>;
    }

    return (
        <div className="space-y-2">
            {editMsg ? (
                <EditCampaignDraftMessageModal
                    key={editMsg.uuid}
                    msg={editMsg}
                    campaignUuid={campaignUuid}
                    onClose={() => setEditMsg(null)}
                />
            ) : null}

            <ConfirmDialog
                isOpen={deleteMsg !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteMsg(null);
                }}
                title="Remove this message?"
                description="This deletes the row from this campaign. If it was already sent, the email may still have reached the recipient."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={deleteMu.isPending}
                onConfirm={async () => {
                    if (!deleteMsg) return;
                    await deleteMu.mutateAsync({
                        campaignUuid,
                        messageUuid: deleteMsg.uuid,
                        contactUuid: deleteMsg.contact_uuid,
                    });
                    setDeleteMsg(null);
                }}
            />

            <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface-secondary/50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Subject / Preview</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide w-28">Actions</th>
                            <th className="px-4 py-3 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((msg) => (
                            <DraftRow
                                key={msg.uuid}
                                msg={msg}
                                isDeletePending={deleteMu.isPending}
                                onEdit={() => setEditMsg(msg)}
                                onDelete={() => setDeleteMsg(msg)}
                            />
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

interface DraftRowProps {
    msg: DraftMessage;
    isDeletePending: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function DraftRow({ msg, isDeletePending, onEdit, onDelete }: DraftRowProps) {
    const [expanded, setExpanded] = useState(false);
    const contactName = msg.contact.name || msg.contact.email || msg.contact.phone || msg.contact_uuid.slice(0, 8);
    const preview = stripHtml(msg.content).slice(0, 120);
    const canMutate = msg.status === MsgStatus.PENDING;

    return (
        <>
            <tr
                className="border-b border-border last:border-0 hover:bg-surface-secondary/30 cursor-pointer"
                onClick={() => setExpanded((v) => !v)}
            >
                <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{contactName}</div>
                    {msg.contact.email ? (
                        <div className="mt-1 flex items-center gap-1 min-w-0">
                            <span className="text-xs text-muted truncate">{msg.contact.email}</span>
                            <CopyButton value={msg.contact.email} label="email" />
                        </div>
                    ) : (
                        <div className="text-xs text-muted mt-1">No email</div>
                    )}
                    {msg.contact.company && (
                        <div className="text-xs text-muted">{msg.contact.company}</div>
                    )}
                </td>
                <td className="px-4 py-3 max-w-xs">
                    {msg.subject && (
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="font-medium text-foreground truncate">{msg.subject}</span>
                            <CopyButton value={msg.subject} label="subject" />
                        </div>
                    )}
                    <div className="flex items-center gap-1 min-w-0 mt-0.5">
                        <span className="text-muted truncate">{preview}…</span>
                        <CopyButton value={stripHtml(msg.content)} label="message" />
                    </div>
                </td>
                <td className="px-4 py-3">
                    <StatusChip status={msg.status} />
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
                    <div className="flex justify-end gap-1">
                        <Button
                            size="sm"
                            variant="tertiary"
                            isDisabled={!canMutate}
                            onPress={onEdit}
                            aria-label="Edit draft"
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            variant="tertiary"
                            className="text-danger"
                            isDisabled={isDeletePending}
                            onPress={onDelete}
                            aria-label="Remove message"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </td>
                <td className="px-4 py-3">
                    {expanded ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                </td>
            </tr>
            {expanded && (
                <tr className="border-b border-border last:border-0 bg-surface-secondary/20">
                    <td colSpan={5} className="px-4 py-4">
                        {msg.subject && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted uppercase tracking-wide">Subject</span>
                                    <CopyButton value={msg.subject} label="subject" />
                                </div>
                                <div className="font-medium text-foreground">{msg.subject}</div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted uppercase tracking-wide">Message</span>
                            <CopyButton value={stripHtml(msg.content)} label="message" />
                        </div>
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

function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast({ title: `Copied ${label}`, variant: "success", duration: 1500 });
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            toast({ title: "Couldn't copy to clipboard", variant: "error" });
        }
    };

    return (
        <span
            className="inline-flex shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
        >
            <Button
                size="sm"
                variant="ghost"
                isDisabled={!value}
                onPress={handleCopy}
                aria-label={`Copy ${label}`}
                className="shrink-0 min-w-7 h-7 px-1"
            >
                {copied ? (
                    <Check className={cn("size-3.5 text-accent")} />
                ) : (
                    <Copy className="size-3.5 text-muted" />
                )}
            </Button>
        </span>
    );
}
