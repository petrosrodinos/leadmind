import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Chip, Input, Label, ListBox, Select, Tabs, TextArea } from "@heroui/react";
import { ArrowLeft, Check, Mail, MessageCircle, Pencil, Plus, RefreshCcw, Send, Sparkles, Trash, X } from "lucide-react";
import { Channel, LeadStatus, MsgStatus, type OutreachMessage } from "@/features/contacts/interfaces/contact.interface";
import { SOURCE_LABEL } from "@/features/leads/constants/source-options";
import { useContact, useDeleteContact, useRedraftMessages, useRescoreContact, useUpdateContact, useUpdateContactNotes, useUpdateContactStatus, useUpdateContactTags } from "@/features/contacts/hooks/use-contacts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Routes } from "@/routes/routes";
import { useDeleteOutreachMessage, useSendOutreachMessage } from "@/features/outreach/hooks/use-outreach";
import { ScoreBadge, StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import { EditMessageModal } from "@/pages/dashboard/pages/leads/components/edit-message-modal";
import { InteractionTimeline } from "@/pages/dashboard/pages/contacts/components/interaction-timeline";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ id: LeadStatus; label: string }> = [
  { id: LeadStatus.NEW, label: "New" },
  { id: LeadStatus.CONTACTED, label: "Contacted" },
  { id: LeadStatus.CONVERTED, label: "Converted" },
  { id: LeadStatus.ARCHIVED, label: "Archived" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "outreach", label: "Outreach" },
  { id: "crm", label: "CRM" },
] as const;

const channelIcon = (channel: Channel) => {
  if (channel === Channel.EMAIL) return Mail;
  if (channel === Channel.LINKEDIN) return MessageCircle;
  return MessageCircle;
};

export default function ContactDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(uuid);
  const deleteContact = useDeleteContact();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!contact) return;
    await deleteContact.mutateAsync(contact.uuid);
    setConfirmDeleteOpen(false);
    navigate(Routes.dashboard.contacts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 min-w-0 flex-wrap">
        <Button size="sm" variant="tertiary" onPress={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <>
              <div className="h-7 w-48 max-w-full rounded-md bg-surface-secondary animate-pulse" />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-5 w-16 rounded-md bg-surface-secondary animate-pulse" />
                <div className="h-5 w-12 rounded-md bg-surface-secondary animate-pulse" />
                <div className="h-5 w-32 rounded-md bg-surface-secondary animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-foreground truncate">{contact?.name ?? "Contact not found"}</h1>
              {contact && (
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <StatusChip status={contact.status} />
                  <ScoreBadge score={contact.score} />
                  {contact.company && <span className="text-sm text-muted truncate">{contact.company}</span>}
                </div>
              )}
            </>
          )}
        </div>

        {contact && (
          <Button variant="tertiary" className="text-danger" isDisabled={deleteContact.isPending} onPress={() => setConfirmDeleteOpen(true)} aria-label="Delete contact">
            <Trash className="size-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
        <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <Tabs.Tab key={t.id} id={t.id} className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap">
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <div className="pt-2">
        {!contact ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-secondary animate-pulse" />
            ))}
          </div>
        ) : activeTab === "overview" ? (
          <OverviewTab contact={contact} />
        ) : activeTab === "timeline" ? (
          <TimelineTab contact={contact} />
        ) : activeTab === "outreach" ? (
          <OutreachTab contact={contact} />
        ) : (
          <CrmTab contact={contact} />
        )}
      </div>

      {contact && <ConfirmDialog isOpen={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} title={`Delete contact "${contact.name ?? "this contact"}"?`} description="This removes the contact from your CRM. The underlying lead record stays in the public directory." confirmLabel="Delete" cancelLabel="Cancel" variant="danger" isPending={deleteContact.isPending} onConfirm={handleConfirmDelete} />}
    </div>
  );
}

interface TabContactProps {
  contact: NonNullable<ReturnType<typeof useContact>["data"]>;
}

interface ProfileDraft {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  title: string;
  location: string;
  linkedin_url: string;
  industry: string;
  description: string;
}

function profileDraftFromContact(contact: NonNullable<ReturnType<typeof useContact>["data"]>): ProfileDraft {
  return {
    name: contact.name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    website: contact.website ?? "",
    title: contact.title ?? "",
    location: contact.location ?? "",
    linkedin_url: contact.linkedin_url ?? "",
    industry: contact.industry ?? "",
    description: contact.description ?? "",
  };
}

function OverviewTab({ contact }: TabContactProps) {
  const updateProfile = useUpdateContact();
  const [draft, setDraft] = useState<ProfileDraft>(() => profileDraftFromContact(contact));

  useEffect(() => {
    setDraft(profileDraftFromContact(contact));
  }, [contact.uuid, contact.updated_at]);

  const dirty = useMemo(() => {
    const prev = profileDraftFromContact(contact);
    return (Object.keys(prev) as (keyof ProfileDraft)[]).some((k) => draft[k].trim() !== prev[k].trim());
  }, [contact, draft]);

  const setField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    const t = (s: string) => s.trim();
    updateProfile.mutate({
      uuid: contact.uuid,
      payload: {
        name: t(draft.name) || undefined,
        email: t(draft.email) || undefined,
        phone: t(draft.phone) || undefined,
        company: t(draft.company) || undefined,
        website: t(draft.website) || undefined,
        title: t(draft.title) || undefined,
        location: t(draft.location) || undefined,
        linkedin_url: t(draft.linkedin_url) || undefined,
        industry: t(draft.industry) || undefined,
        description: t(draft.description) || undefined,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Contact"
        action={
          <Button size="sm" variant="secondary" isDisabled={!dirty || updateProfile.isPending} isPending={updateProfile.isPending} onPress={handleSave}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-company">Company</Label>
            <Input id="pf-company" value={draft.company} onChange={(e) => setField("company", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-email">Email</Label>
            <Input id="pf-email" type="email" value={draft.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-phone">Phone</Label>
            <Input id="pf-phone" value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-title">Title</Label>
            <Input id="pf-title" value={draft.title} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-location">Location</Label>
            <Input id="pf-location" value={draft.location} onChange={(e) => setField("location", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-industry">Industry</Label>
            <Input id="pf-industry" value={draft.industry} onChange={(e) => setField("industry", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-website">Website</Label>
            <Input id="pf-website" value={draft.website} onChange={(e) => setField("website", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-linkedin">LinkedIn</Label>
            <Input id="pf-linkedin" value={draft.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="pf-name">Name</Label>
            <Input id="pf-name" value={draft.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-description">Description</Label>
          <TextArea id="pf-description" rows={4} value={draft.description} onChange={(e) => setField("description", e.target.value)} />
        </div>
        <Field label="Source" value={SOURCE_LABEL[contact.lead.source_type]} />
      </Section>

      <Section title="Public enrichment summary">{contact.lead.enrichment_data && Object.keys(contact.lead.enrichment_data).length > 0 ? <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono p-3 rounded-lg bg-surface-secondary border border-border">{JSON.stringify(contact.lead.enrichment_data, null, 2)}</pre> : <p className="text-sm text-muted italic">No enrichment available yet.</p>}</Section>
    </div>
  );
}

function TimelineTab({ contact }: TabContactProps) {
  return (
    <Section title="Activity">
      <InteractionTimeline contactUuid={contact.uuid} />
    </Section>
  );
}

function OutreachTab({ contact }: TabContactProps) {
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

function CrmTab({ contact }: TabContactProps) {
  const updateStatus = useUpdateContactStatus();
  const updateNotes = useUpdateContactNotes();
  const updateTags = useUpdateContactTags();
  const rescore = useRescoreContact();

  const [notes, setNotes] = useState(contact.notes ?? "");

  useEffect(() => {
    setNotes(contact.notes ?? "");
  }, [contact.uuid, contact.notes]);

  const notesDirty = (contact.notes ?? "") !== notes;

  const handleTagsChange = (next: string[]) => updateTags.mutate({ uuid: contact.uuid, tags: next });

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="CRM state"
        action={
          <Button size="sm" variant="tertiary" isDisabled={rescore.isPending} isPending={rescore.isPending} onPress={() => rescore.mutate(contact.uuid)}>
            <Sparkles className="size-3.5" />
            Rescore
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Status</p>
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
                    <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                      {opt.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">AI score</p>
            <ScoreBadge score={contact.score} />
          </div>
          <div className="sm:col-span-1">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Tags</p>
            <TagEditor tags={contact.tags} onChange={handleTagsChange} disabled={updateTags.isPending} />
          </div>
        </div>
      </Section>

      <Section title="Notes">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-notes">Notes</Label>
          <TextArea id="contact-notes" aria-label="Notes" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              isDisabled={!notesDirty || updateNotes.isPending}
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
    </div>
  );
}

interface TagEditorProps {
  tags: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

function TagEditor({ tags, onChange, disabled }: TagEditorProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const commitAdd = () => {
    const t = draft.trim();
    setAdding(false);
    setDraft("");
    if (!t) return;
    if (tags.includes(t)) return;
    onChange([...tags, t]);
  };

  const cancelAdd = () => {
    setAdding(false);
    setDraft("");
  };

  const remove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const beginEdit = (idx: number, current: string) => {
    setEditingIdx(idx);
    setEditingValue(current);
    // Focus next tick so the input is mounted.
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    const next = editingValue.trim();
    const prev = tags[editingIdx]!;
    if (!next || next === prev) {
      setEditingIdx(null);
      setEditingValue("");
      return;
    }
    if (tags.includes(next)) {
      // Editing into a duplicate just removes the original.
      onChange(tags.filter((_, i) => i !== editingIdx));
    } else {
      onChange(tags.map((t, i) => (i === editingIdx ? next : t)));
    }
    setEditingIdx(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditingValue("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, idx) =>
        editingIdx === idx ? (
          <span key={`edit-${idx}`} className="inline-flex items-center gap-1 rounded-md bg-surface-secondary border border-border px-2 py-0.5">
            <Input
              ref={editInputRef}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              onBlur={commitEdit}
              className="h-6 px-1 text-xs w-24 bg-transparent border-0 shadow-none focus-visible:ring-0"
              aria-label="Edit tag"
            />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={commitEdit} className="text-muted hover:text-success" aria-label="Save tag">
              <Check className="size-3" />
            </button>
          </span>
        ) : (
          <Chip key={tag} size="sm" variant="soft">
            <button type="button" disabled={disabled} onClick={() => beginEdit(idx, tag)} className="cursor-text disabled:cursor-not-allowed" aria-label={`Edit tag ${tag}`}>
              <Chip.Label>{tag}</Chip.Label>
            </button>
            <button type="button" disabled={disabled} onClick={() => remove(tag)} className="ml-1 text-muted hover:text-danger disabled:opacity-50" aria-label={`Remove tag ${tag}`}>
              <X className="size-3" />
            </button>
          </Chip>
        ),
      )}

      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary border border-border px-2 py-0.5">
          <Input
            ref={addInputRef}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitAdd();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelAdd();
              }
            }}
            onBlur={commitAdd}
            placeholder="tag name"
            className="h-6 px-1 text-xs w-28 bg-transparent border-0 shadow-none focus-visible:ring-0"
            aria-label="New tag"
          />
        </span>
      ) : (
        <Button
          size="sm"
          variant="tertiary"
          isDisabled={disabled}
          onPress={() => {
            setAdding(true);
            setDraft("");
          }}
          aria-label="Add tag"
        >
          <Plus className="size-3.5" />
          Add tag
        </Button>
      )}

      {tags.length === 0 && !adding && <span className="text-xs text-muted italic">Click on a tag to edit, X to remove.</span>}
    </div>
  );
}

function Section({ title, action, children, emptyText }: { title: string; action?: React.ReactNode; children: React.ReactNode; emptyText?: string }) {
  const empty = Array.isArray((children as any)?.props?.children) && (children as any).props.children.length === 0;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      {empty && emptyText ? <p className="text-sm text-muted italic">{emptyText}</p> : children}
    </section>
  );
}

function Field({ label, value, link = false }: { label: string; value: string | null | undefined; link?: boolean }) {
  return (
    <div>
      <p className={cn("text-xs font-medium text-muted uppercase tracking-wide")}>{label}</p>
      {!value ? (
        <p className="text-sm text-muted italic mt-0.5">Not provided</p>
      ) : link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline mt-0.5 break-all">
          {value}
        </a>
      ) : (
        <p className="text-sm text-foreground mt-0.5 whitespace-pre-line break-words">{value}</p>
      )}
    </div>
  );
}
