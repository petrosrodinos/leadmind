import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Pencil, Plus, RefreshCcw, Send, Trash } from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { MsgStatus, type OutreachMessage } from "@/features/contacts/interfaces/contact.interface";
import { useRedraftMessages } from "@/features/contacts/hooks/use-contacts";
import { useDeleteOutreachMessage, useSendOutreachMessage } from "@/features/outreach/hooks/use-outreach";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditMessageModal } from "@/pages/dashboard/pages/leads/components/edit-message-modal";
import { cn } from "@/lib/utils";
import { ComposeMessageModal } from "./compose-message-modal";
import { MessageBodyPreview } from "./message-body-preview";
import { Section } from "./section";
import { channelIcon } from "../utils/channel-icon";

interface OutreachTabProps {
  contact: Contact;
  highlightUuid?: string | null;
  onHighlightConsumed?: () => void;
}

export function OutreachTab({ contact, highlightUuid, onHighlightConsumed }: OutreachTabProps) {
  const redraft = useRedraftMessages();
  const sendMessage = useSendOutreachMessage();
  const deleteMessage = useDeleteOutreachMessage();

  const [editingMessage, setEditingMessage] = useState<OutreachMessage | null>(null);
  const [draftPendingDelete, setDraftPendingDelete] = useState<OutreachMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [ringedUuid, setRingedUuid] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!highlightUuid) return;
    const el = cardRefs.current.get(highlightUuid);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setRingedUuid(highlightUuid);
    const fadeT = window.setTimeout(() => setRingedUuid(null), 1500);
    const clearT = window.setTimeout(() => onHighlightConsumed?.(), 1600);
    return () => {
      window.clearTimeout(fadeT);
      window.clearTimeout(clearT);
    };
  }, [highlightUuid, onHighlightConsumed]);

  const setCardRef = (uuid: string) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(uuid, el);
    else cardRefs.current.delete(uuid);
  };

  const { drafts, sentHistory } = useMemo(() => {
    const messages = contact.outreach_messages ?? [];
    const drafts = messages.filter((m) => m.status === MsgStatus.PENDING);
    const sentHistory = messages
      .filter((m) => m.status === MsgStatus.SENT || m.status === MsgStatus.FAILED)
      .sort((a, b) => {
        const at = a.sent_at ?? a.updated_at;
        const bt = b.sent_at ?? b.updated_at;
        return bt.localeCompare(at);
      });
    return { drafts, sentHistory };
  }, [contact.outreach_messages]);

  return (
    <div className="flex flex-col gap-6">
      <Section
        title={`Drafted outreach (${drafts.length})`}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="tertiary" onPress={() => setComposeOpen(true)}>
              <Plus className="size-3.5" />
              New message
            </Button>
            <Button size="sm" variant="secondary" isDisabled={redraft.isPending} isPending={redraft.isPending} onPress={() => redraft.mutate(contact.uuid)}>
              <RefreshCcw className="size-3.5" />
              Redraft messages
            </Button>
          </div>
        }
        emptyText="No pending drafts. Click New message to write one, or Redraft messages to generate filter-based drafts."
      >
        <div className="flex flex-col gap-2">
          {drafts.map((m) => {
            const Icon = channelIcon(m.channel);
            return (
              <div
                key={m.uuid}
                ref={setCardRef(m.uuid)}
                className={cn(
                  "rounded-lg border border-border bg-surface-secondary p-3 flex flex-col gap-2 transition-shadow",
                  ringedUuid === m.uuid && "ring-2 ring-accent ring-offset-1 ring-offset-background",
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="size-4 text-muted shrink-0" />
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{m.channel}</Chip.Label>
                    </Chip>
                    {m.subject && <span className="text-sm font-medium text-foreground truncate">{m.subject}</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <Button size="sm" variant="tertiary" onPress={() => setEditingMessage(m)} aria-label="Edit draft">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      isDisabled={sendMessage.isPending}
                      onPress={() =>
                        sendMessage.mutate({
                          uuid: m.uuid,
                          contact_uuid: contact.uuid,
                        })
                      }
                      aria-label="Send draft"
                    >
                      <Send className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="tertiary" isDisabled={deleteMessage.isPending} onPress={() => setDraftPendingDelete(m)} aria-label="Delete draft">
                      <Trash className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <MessageBodyPreview channel={m.channel} content={m.content} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={`Sent history (${sentHistory.length})`} emptyText="No messages have been sent yet.">
        <div className="flex flex-col gap-2">
          {sentHistory.map((m) => (
            <div
              key={m.uuid}
              ref={setCardRef(m.uuid)}
              className={cn(
                "rounded-lg border border-border p-3 flex flex-col gap-1 transition-shadow",
                ringedUuid === m.uuid && "ring-2 ring-accent ring-offset-1 ring-offset-background",
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Chip size="sm" color={m.status === MsgStatus.SENT ? "success" : "danger"} variant="soft">
                  <Chip.Label>{m.status}</Chip.Label>
                </Chip>
                <Chip size="sm" variant="soft">
                  <Chip.Label>{m.channel}</Chip.Label>
                </Chip>
                {m.subject && <span className="text-sm font-medium text-foreground truncate">{m.subject}</span>}
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {m.status === MsgStatus.FAILED ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      isDisabled={sendMessage.isPending}
                      onPress={() =>
                        sendMessage.mutate({
                          uuid: m.uuid,
                          contact_uuid: contact.uuid,
                        })
                      }
                    >
                      <RefreshCcw className="size-3.5" />
                      Resend
                    </Button>
                  ) : null}
                  <span className="text-xs text-muted whitespace-nowrap">
                    {m.sent_at ? new Date(m.sent_at).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
              <MessageBodyPreview channel={m.channel} content={m.content} />
            </div>
          ))}
        </div>
      </Section>

      <EditMessageModal
        message={editingMessage}
        isOpen={editingMessage !== null}
        onOpenChange={(open) => {
          if (!open) setEditingMessage(null);
        }}
        contact_uuid={contact.uuid}
      />

      <ComposeMessageModal
        isOpen={composeOpen}
        onOpenChange={setComposeOpen}
        contact_uuid={contact.uuid}
      />

      <ConfirmDialog
        isOpen={draftPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setDraftPendingDelete(null);
        }}
        title="Delete this draft?"
        description={
          draftPendingDelete
            ? `This removes the pending ${draftPendingDelete.channel} draft. You can generate a new one with Redraft messages.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isPending={deleteMessage.isPending}
        onConfirm={async () => {
          if (!draftPendingDelete) return;
          try {
            await deleteMessage.mutateAsync({
              uuid: draftPendingDelete.uuid,
              contact_uuid: contact.uuid,
            });
            setDraftPendingDelete(null);
          } catch {
            return;
          }
        }}
      />
    </div>
  );
}
