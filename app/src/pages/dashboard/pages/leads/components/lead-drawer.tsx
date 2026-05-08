import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Chip,
    Drawer,
    Label,
    ListBox,
    Select,
    TextArea,
} from "@heroui/react";
import {
    Mail,
    MessageCircle,
    Pencil,
    RefreshCcw,
    Send,
    Sparkles,
    Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Channel,
    LeadStatus,
    MsgStatus,
    type OutreachMessage,
} from "@/features/contacts/interfaces/contact.interface";
import { SOURCE_LABEL } from "@/features/leads/constants/source-options";
import {
    useContact,
    useRedraftMessages,
    useRescoreContact,
    useUpdateContactNotes,
    useUpdateContactStatus,
} from "@/features/contacts/hooks/use-contacts";
import {
    useDeleteOutreachMessage,
    useSendOutreachMessage,
} from "@/features/outreach/hooks/use-outreach";
import { ScoreBadge } from "./badges";
import { EditMessageModal } from "./edit-message-modal";

const STATUS_OPTIONS: Array<{ id: LeadStatus; label: string }> = [
    { id: LeadStatus.NEW, label: "New" },
    { id: LeadStatus.CONTACTED, label: "Contacted" },
    { id: LeadStatus.CONVERTED, label: "Converted" },
    { id: LeadStatus.ARCHIVED, label: "Archived" },
];

const channelIcon = (channel: Channel) => {
    if (channel === Channel.EMAIL) return Mail;
    if (channel === Channel.LINKEDIN) return MessageCircle;
    return MessageCircle;
};

interface LeadDrawerProps {
    contactUuid: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeadDrawer({ contactUuid, isOpen, onOpenChange }: LeadDrawerProps) {
    const { data: contact, isLoading } = useContact(contactUuid);

    const updateStatus = useUpdateContactStatus();
    const updateNotes = useUpdateContactNotes();
    const rescore = useRescoreContact();
    const redraft = useRedraftMessages();
    const sendMessage = useSendOutreachMessage();
    const deleteMessage = useDeleteOutreachMessage();

    const [editingMessage, setEditingMessage] = useState<OutreachMessage | null>(null);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (contact) setNotes(contact.notes ?? "");
    }, [contact?.uuid, contact?.notes]);

    const { drafts, sentHistory } = useMemo(() => {
        const messages = contact?.outreach_messages ?? [];
        const drafts = messages.filter((m) => m.status === MsgStatus.PENDING);
        const sentHistory = messages
            .filter((m) => m.status === MsgStatus.SENT || m.status === MsgStatus.FAILED)
            .sort((a, b) => {
                const at = a.sent_at ?? a.updated_at;
                const bt = b.sent_at ?? b.updated_at;
                return bt.localeCompare(at);
            });
        return { drafts, sentHistory };
    }, [contact?.outreach_messages]);

    const notesDirty = (contact?.notes ?? "") !== notes;

    return (
        <>
            <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
                <Drawer.Content placement="right">
                    <Drawer.Dialog className="sm:max-w-2xl">
                        <Drawer.CloseTrigger />
                        <Drawer.Header>
                            <Drawer.Heading>
                                {contact?.lead.name ?? (isLoading ? "Loading…" : "Contact")}
                            </Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.Body>
                            {!contact ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-12 rounded-lg bg-surface-secondary animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {/* Lead facts */}
                                    <Section title="Lead">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="Company" value={contact.lead.company} />
                                            <Field label="Email" value={contact.lead.email} />
                                            <Field label="Phone" value={contact.lead.phone} />
                                            <Field label="Title" value={contact.lead.title} />
                                            <Field
                                                label="Location"
                                                value={contact.lead.location}
                                            />
                                            <Field
                                                label="Industry"
                                                value={contact.lead.industry}
                                            />
                                            <Field
                                                label="Website"
                                                value={contact.lead.website}
                                                link
                                            />
                                            <Field
                                                label="LinkedIn"
                                                value={contact.lead.linkedin_url}
                                                link
                                            />
                                            <Field
                                                label="Source"
                                                value={SOURCE_LABEL[contact.lead.source_type]}
                                            />
                                        </div>
                                        <Field
                                            label="Description"
                                            value={contact.lead.description}
                                        />
                                    </Section>

                                    {/* Public enrichment */}
                                    <Section title="Public enrichment summary">
                                        {contact.lead.enrichment_data &&
                                        Object.keys(contact.lead.enrichment_data).length > 0 ? (
                                            <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono p-3 rounded-lg bg-surface-secondary border border-border">
                                                {JSON.stringify(
                                                    contact.lead.enrichment_data,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        ) : (
                                            <p className="text-sm text-muted italic">
                                                No enrichment available yet.
                                            </p>
                                        )}
                                    </Section>

                                    {/* Per-user state */}
                                    <Section
                                        title="Your CRM"
                                        action={
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="tertiary"
                                                    isDisabled={rescore.isPending}
                                                    isPending={rescore.isPending}
                                                    onPress={() => rescore.mutate(contact.uuid)}
                                                >
                                                    <Sparkles className="size-3.5" />
                                                    Rescore
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    isDisabled={redraft.isPending}
                                                    isPending={redraft.isPending}
                                                    onPress={() => redraft.mutate(contact.uuid)}
                                                >
                                                    <RefreshCcw className="size-3.5" />
                                                    Redraft messages
                                                </Button>
                                            </div>
                                        }
                                    >
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                                                    Status
                                                </p>
                                                <Select
                                                    className="w-full"
                                                    value={contact.status}
                                                    onChange={(v) =>
                                                        updateStatus.mutate({
                                                            uuid: contact.uuid,
                                                            status: v as LeadStatus,
                                                        })
                                                    }
                                                >
                                                    <Select.Trigger>
                                                        <Select.Value />
                                                        <Select.Indicator />
                                                    </Select.Trigger>
                                                    <Select.Popover>
                                                        <ListBox>
                                                            {STATUS_OPTIONS.map((opt) => (
                                                                <ListBox.Item
                                                                    key={opt.id}
                                                                    id={opt.id}
                                                                    textValue={opt.label}
                                                                >
                                                                    {opt.label}
                                                                    <ListBox.ItemIndicator />
                                                                </ListBox.Item>
                                                            ))}
                                                        </ListBox>
                                                    </Select.Popover>
                                                </Select>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                                                    AI Score
                                                </p>
                                                <ScoreBadge score={contact.score} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                                                    Tags
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.length === 0 ? (
                                                        <span className="text-sm text-muted italic">
                                                            No tags
                                                        </span>
                                                    ) : (
                                                        contact.tags.map((tag) => (
                                                            <Chip
                                                                key={tag}
                                                                size="sm"
                                                                variant="soft"
                                                            >
                                                                <Chip.Label>{tag}</Chip.Label>
                                                            </Chip>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-col gap-1.5">
                                            <Label htmlFor="contact-notes">Notes</Label>
                                            <TextArea
                                                id="contact-notes"
                                                aria-label="Notes"
                                                rows={5}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    isDisabled={
                                                        !notesDirty || updateNotes.isPending
                                                    }
                                                    isPending={updateNotes.isPending}
                                                    onPress={() =>
                                                        updateNotes.mutate({
                                                            uuid: contact.uuid,
                                                            notes,
                                                        })
                                                    }
                                                >
                                                    Save notes
                                                </Button>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* Pending drafts */}
                                    <Section
                                        title={`Drafted outreach (${drafts.length})`}
                                        emptyText="No pending drafts. Click Redraft messages to generate new ones."
                                    >
                                        <div className="flex flex-col gap-2">
                                            {drafts.map((m) => {
                                                const Icon = channelIcon(m.channel);
                                                return (
                                                    <div
                                                        key={m.uuid}
                                                        className="rounded-lg border border-border bg-surface-secondary p-3 flex flex-col gap-2"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Icon className="size-4 text-muted shrink-0" />
                                                                <Chip size="sm" variant="soft">
                                                                    <Chip.Label>
                                                                        {m.channel}
                                                                    </Chip.Label>
                                                                </Chip>
                                                                {m.subject && (
                                                                    <span className="text-sm font-medium text-foreground truncate">
                                                                        {m.subject}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="tertiary"
                                                                    onPress={() =>
                                                                        setEditingMessage(m)
                                                                    }
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="tertiary"
                                                                    isDisabled={
                                                                        sendMessage.isPending
                                                                    }
                                                                    onPress={() =>
                                                                        sendMessage.mutate({
                                                                            uuid: m.uuid,
                                                                            contact_uuid:
                                                                                contact.uuid,
                                                                        })
                                                                    }
                                                                >
                                                                    <Send className="size-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="tertiary"
                                                                    isDisabled={
                                                                        deleteMessage.isPending
                                                                    }
                                                                    onPress={() =>
                                                                        deleteMessage.mutate({
                                                                            uuid: m.uuid,
                                                                            contact_uuid:
                                                                                contact.uuid,
                                                                        })
                                                                    }
                                                                >
                                                                    <Trash className="size-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted line-clamp-3 whitespace-pre-line">
                                                            {m.content}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Section>

                                    {/* Sent history */}
                                    <Section
                                        title={`Sent history (${sentHistory.length})`}
                                        emptyText="No messages have been sent yet."
                                    >
                                        <div className="flex flex-col gap-2">
                                            {sentHistory.map((m) => (
                                                <div
                                                    key={m.uuid}
                                                    className="rounded-lg border border-border p-3 flex flex-col gap-1"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Chip
                                                            size="sm"
                                                            color={
                                                                m.status === MsgStatus.SENT
                                                                    ? "success"
                                                                    : "danger"
                                                            }
                                                            variant="soft"
                                                        >
                                                            <Chip.Label>{m.status}</Chip.Label>
                                                        </Chip>
                                                        <Chip size="sm" variant="soft">
                                                            <Chip.Label>{m.channel}</Chip.Label>
                                                        </Chip>
                                                        {m.subject && (
                                                            <span className="text-sm font-medium text-foreground truncate">
                                                                {m.subject}
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-xs text-muted">
                                                            {m.sent_at
                                                                ? new Date(
                                                                      m.sent_at,
                                                                  ).toLocaleString()
                                                                : "—"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted line-clamp-2 whitespace-pre-line">
                                                        {m.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                </div>
                            )}
                        </Drawer.Body>
                        <Drawer.Footer>
                            <Button slot="close" variant="secondary">
                                Close
                            </Button>
                        </Drawer.Footer>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
            <EditMessageModal
                message={editingMessage}
                isOpen={editingMessage !== null}
                onOpenChange={(open) => {
                    if (!open) setEditingMessage(null);
                }}
                contact_uuid={contact?.uuid}
            />
        </>
    );
}

function Section({
    title,
    action,
    children,
    emptyText,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    emptyText?: string;
}) {
    const empty =
        Array.isArray((children as any)?.props?.children) &&
        (children as any).props.children.length === 0;
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {action}
            </div>
            {empty && emptyText ? (
                <p className="text-sm text-muted italic">{emptyText}</p>
            ) : (
                children
            )}
        </section>
    );
}

function Field({
    label,
    value,
    link = false,
}: {
    label: string;
    value: string | null | undefined;
    link?: boolean;
}) {
    return (
        <div>
            <p className={cn("text-xs font-medium text-muted uppercase tracking-wide")}>
                {label}
            </p>
            {!value ? (
                <p className="text-sm text-muted italic mt-0.5">Not provided</p>
            ) : link ? (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline mt-0.5 break-all"
                >
                    {value}
                </a>
            ) : (
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-line">{value}</p>
            )}
        </div>
    );
}
