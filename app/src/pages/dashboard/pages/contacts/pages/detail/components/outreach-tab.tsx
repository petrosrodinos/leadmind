import { useMemo, useState } from "react";
import { Button, Chip } from "@heroui/react";
import { Pencil, RefreshCcw, Send, Trash } from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { MsgStatus, type OutreachMessage } from "@/features/contacts/interfaces/contact.interface";
import { useRedraftMessages } from "@/features/contacts/hooks/use-contacts";
import { useDeleteOutreachMessage, useSendOutreachMessage } from "@/features/outreach/hooks/use-outreach";
import { EditMessageModal } from "@/pages/dashboard/pages/leads/components/edit-message-modal";
import { Section } from "./section";
import { channelIcon } from "../utils/channel-icon";

interface OutreachTabProps {
  contact: Contact;
}

export function OutreachTab({ contact }: OutreachTabProps) {
  const redraft = useRedraftMessages();
  const sendMessage = useSendOutreachMessage();
  const deleteMessage = useDeleteOutreachMessage();

  const [editingMessage, setEditingMessage] = useState<OutreachMessage | null>(null);

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
          <Button size="sm" variant="secondary" isDisabled={redraft.isPending} isPending={redraft.isPending} onPress={() => redraft.mutate(contact.uuid)}>
            <RefreshCcw className="size-3.5" />
            Redraft messages
          </Button>
        }
        emptyText="No pending drafts. Click Redraft messages to generate new ones."
      >
        <div className="flex flex-col gap-2">
          {drafts.map((m) => {
            const Icon = channelIcon(m.channel);
            return (
              <div key={m.uuid} className="rounded-lg border border-border bg-surface-secondary p-3 flex flex-col gap-2">
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
                    <Button
                      size="sm"
                      variant="tertiary"
                      isDisabled={deleteMessage.isPending}
                      onPress={() =>
                        deleteMessage.mutate({
                          uuid: m.uuid,
                          contact_uuid: contact.uuid,
                        })
                      }
                      aria-label="Delete draft"
                    >
                      <Trash className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted whitespace-pre-line">{m.content}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={`Sent history (${sentHistory.length})`} emptyText="No messages have been sent yet.">
        <div className="flex flex-col gap-2">
          {sentHistory.map((m) => (
            <div key={m.uuid} className="rounded-lg border border-border p-3 flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Chip size="sm" color={m.status === MsgStatus.SENT ? "success" : "danger"} variant="soft">
                  <Chip.Label>{m.status}</Chip.Label>
                </Chip>
                <Chip size="sm" variant="soft">
                  <Chip.Label>{m.channel}</Chip.Label>
                </Chip>
                {m.subject && <span className="text-sm font-medium text-foreground truncate">{m.subject}</span>}
                <span className="ml-auto text-xs text-muted whitespace-nowrap">{m.sent_at ? new Date(m.sent_at).toLocaleString() : "—"}</span>
              </div>
              <p className="text-sm text-muted whitespace-pre-line">{m.content}</p>
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
    </div>
  );
}
