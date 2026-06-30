import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Check, ChevronDown, ChevronUp, Copy, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCampaignDraftMessages, useDeleteCampaignDraftMessage, useSendCampaignDraftMessage } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type { DraftMessage } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignContactStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import type { EmailProviderTarget } from "@/features/integrations/interfaces/integrations.interface";
import { Channel, MsgStatus } from "@/features/contacts/interfaces/contact.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmailProviderSelect } from "@/features/messaging/components/email-provider-select";
import { SenderProfileSelect } from "@/features/messaging/components/sender-profile-select";
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide w-36">Actions</th>
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
    const [sendMsg, setSendMsg] = useState<DraftMessage | null>(null);
    const [sendEmailProvider, setSendEmailProvider] = useState<EmailProviderTarget | null>(null);
    const [sendSenderProfileUuid, setSendSenderProfileUuid] = useState<string | null>(null);
    const deleteMu = useDeleteCampaignDraftMessage();
    const sendMu = useSendCampaignDraftMessage();

    useEffect(() => {
        if (!sendMsg) {
            setSendEmailProvider(null);
            setSendSenderProfileUuid(null);
        }
    }, [sendMsg]);

    const sendRequiresEmailProvider = sendMsg?.channel === Channel.EMAIL;
    const sendEmailProviderReady = !sendRequiresEmailProvider || sendEmailProvider != null;
    const sendSenderProfileReady = sendSenderProfileUuid != null;

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
                isOpen={sendMsg !== null}
                onOpenChange={(open) => {
                    if (!open) setSendMsg(null);
                }}
                title="Send this message?"
                description={
                    sendMsg ? (
                        <>
                            <p>
                                This will queue the {sendMsg.channel} message for delivery to{" "}
                                {draftContactLabel(sendMsg)}. You won&apos;t be able to edit it after
                                sending.
                            </p>
                            {sendRequiresEmailProvider ? (
                                <div className="mt-4">
                                    <EmailProviderSelect
                                        value={sendEmailProvider}
                                        onChange={setSendEmailProvider}
                                        disabled={sendMu.isPending}
                                    />
                                </div>
                            ) : null}
                            <div className="mt-4">
                                <SenderProfileSelect
                                    value={sendSenderProfileUuid}
                                    onChange={setSendSenderProfileUuid}
                                    disabled={sendMu.isPending}
                                />
                            </div>
                        </>
                    ) : undefined
                }
                confirmLabel="Send"
                cancelLabel="Cancel"
                variant="default"
                isPending={sendMu.isPending}
                isConfirmDisabled={!sendEmailProviderReady || !sendSenderProfileReady}
                onConfirm={async () => {
                    if (!sendMsg || !sendSenderProfileUuid) return;
                    await sendMu.mutateAsync({
                        campaignUuid,
                        messageUuid: sendMsg.uuid,
                        contactUuid: sendMsg.contact_uuid,
                        ...(sendRequiresEmailProvider && sendEmailProvider
                            ? {
                                  email_provider: sendEmailProvider.provider,
                                  email_account: sendEmailProvider.account,
                              }
                            : {}),
                        sender_profile_uuid: sendSenderProfileUuid,
                    });
                    setSendMsg(null);
                }}
            />

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
                            <th className="px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wide w-36">Actions</th>
                            <th className="px-4 py-3 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((msg) => (
                            <DraftRow
                                key={msg.uuid}
                                msg={msg}
                                isDeletePending={deleteMu.isPending}
                                isSendPending={sendMu.isPending}
                                onEdit={() => setEditMsg(msg)}
                                onSend={() => setSendMsg(msg)}
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
    isSendPending: boolean;
    onEdit: () => void;
    onSend: () => void;
    onDelete: () => void;
}

function DraftRow({ msg, isDeletePending, isSendPending, onEdit, onSend, onDelete }: DraftRowProps) {
    const [expanded, setExpanded] = useState(false);
    const contactName = msg.contact.name || msg.contact.email || msg.contact.phone || msg.contact_uuid.slice(0, 8);
    const preview = stripHtml(msg.content).slice(0, 120);
    const canSend = canSendDraft(msg);
    const canEdit = canEditDraft(msg);

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
                        <ActionButtonWithPending
                            size="sm"
                            variant="tertiary"
                            isDisabled={!canSend}
                            isPending={isSendPending}
                            onPress={onSend}
                            aria-label="Send draft"
                            idleLeading={<Send className="size-3.5 text-emerald-400" />}
                        >
                            {null}
                        </ActionButtonWithPending>
                        <Button
                            size="sm"
                            variant="tertiary"
                            isDisabled={!canEdit}
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

function draftContactLabel(msg: DraftMessage): string {
    return msg.contact.name || msg.contact.email || msg.contact.phone || "this contact";
}

function canSendDraft(msg: DraftMessage): boolean {
    if (msg.status === MsgStatus.QUEUED) {
        return false;
    }
    if (msg.channel === Channel.EMAIL) {
        return !!msg.contact.email;
    }
    if (msg.channel === Channel.SMS) {
        return !!msg.contact.phone;
    }
    return true;
}

function canEditDraft(msg: DraftMessage): boolean {
    return msg.status !== MsgStatus.QUEUED;
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
