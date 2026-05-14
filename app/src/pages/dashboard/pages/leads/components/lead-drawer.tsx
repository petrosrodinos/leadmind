import { type ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Chip, Drawer } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { ExternalLink, Mail, MessageCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Channel, MsgStatus } from "@/features/contacts/interfaces/contact.interface";
import { SourceBadge } from "@/components/ui/source-badge";
import { useContact } from "@/features/contacts/hooks/use-contacts";
import { useSendOutreachMessage } from "@/features/outreach/hooks/use-outreach";
import { Routes } from "@/routes/routes";
import { ContactScoresCompact, StatusChip } from "./badges";

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
  const sendMessage = useSendOutreachMessage();

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

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full sm:max-w-lg lg:max-w-xl">
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{isLoading && !contact ? <span className="inline-block h-6 w-40 rounded-md bg-surface-secondary animate-pulse align-middle" /> : (contact?.name ?? "Contact")}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            {!contact ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-surface-secondary animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Quick state */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusChip status={contact.status} />
                  <ContactScoresCompact contact={contact} />
                  {contact.tags.map((tag) => (
                    <Chip key={tag} size="sm" variant="soft">
                      <Chip.Label>{tag}</Chip.Label>
                    </Chip>
                  ))}
                </div>

                {/* Lead facts */}
                <Section title="Contact">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <Field label="Company" value={contact.company} />
                    <Field label="Email" value={contact.email} />
                    <Field label="Phone" value={contact.phone} />
                    <Field label="Title" value={contact.title} />
                    <Field label="Location" value={contact.location} />
                    <Field label="Industry" value={contact.industry} />
                    <Field label="Website" value={contact.website} link />
                    <Field label="LinkedIn" value={contact.linkedin_url} link />
                    <Field label="Source">
                      <SourceBadge source={contact.lead.source_type} />
                    </Field>
                  </div>
                  <Field label="Description" value={contact.description} />
                </Section>

                {/* Notes */}
                {contact.notes && (
                  <Section title="Notes">
                    <p className="text-sm text-foreground whitespace-pre-line break-words">{contact.notes}</p>
                  </Section>
                )}

                {/* Pending drafts */}
                <Section title={`Drafted outreach (${drafts.length})`} emptyText="No pending drafts.">
                  <div className="flex flex-col gap-2">
                    {drafts.map((m) => {
                      const Icon = channelIcon(m.channel);
                      return (
                        <div key={m.uuid} className="rounded-lg border border-border bg-surface-secondary p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <Icon className="size-4 text-muted shrink-0" />
                            <Chip size="sm" variant="soft">
                              <Chip.Label>{m.channel}</Chip.Label>
                            </Chip>
                            {m.subject && <span className="text-sm font-medium text-foreground truncate">{m.subject}</span>}
                          </div>
                          <p className="text-sm text-muted line-clamp-3 whitespace-pre-line">{m.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* Sent history */}
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
                          <div className="ml-auto flex items-center gap-2 shrink-0">
                            {m.status === MsgStatus.FAILED ? (
                              <ActionButtonWithPending
                                size="sm"
                                variant="secondary"
                                isDisabled={sendMessage.isPending}
                                isPending={sendMessage.isPending}
                                onPress={() =>
                                  sendMessage.mutate({
                                    uuid: m.uuid,
                                    contact_uuid: contact.uuid,
                                  })
                                }
                                idleLeading={<RefreshCcw className="size-3.5" />}
                              >
                                Resend
                              </ActionButtonWithPending>
                            ) : null}
                            <span className="text-xs text-muted whitespace-nowrap">
                              {m.sent_at ? new Date(m.sent_at).toLocaleString() : "—"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted line-clamp-2 whitespace-pre-line">{m.content}</p>
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
            {contact && (
              <Link to={Routes.dashboard.contacts_detail.replace(":uuid", contact.uuid)}>
                <Button>
                  <ExternalLink className="size-4" />
                  Open full page
                </Button>
              </Link>
            )}
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function Section({ title, children, emptyText }: { title: string; children: React.ReactNode; emptyText?: string }) {
  const empty = Array.isArray((children as any)?.props?.children) && (children as any).props.children.length === 0;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {empty && emptyText ? <p className="text-sm text-muted italic">{emptyText}</p> : children}
    </section>
  );
}

function Field({ label, value, link = false, children }: { label: string; value?: string | null | undefined; link?: boolean; children?: ReactNode }) {
  return (
    <div>
      <p className={cn("text-xs font-medium text-muted uppercase tracking-wide")}>{label}</p>
      <div className="mt-0.5">
        {children != null ? (
          children
        ) : !value ? (
          <p className="text-sm text-muted italic">Not provided</p>
        ) : link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground mt-0.5 whitespace-pre-line break-words">{value}</p>
        )}
      </div>
    </div>
  );
}
