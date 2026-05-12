import { useEffect, useState } from "react";
import { Button, ListBox, Select, TextArea } from "@heroui/react";
import { CalendarDays, Phone, Sparkles } from "lucide-react";
import type { Contact, LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";
import { useRescoreContact, useUpdateContactNotes, useUpdateContactStatus, useUpdateContactTags } from "@/features/contacts/hooks/use-contacts";
import { ScoreBadge } from "@/pages/dashboard/pages/leads/components/badges";
import { InteractionTimeline } from "@/pages/dashboard/pages/contacts/components/interaction-timeline";
import { ChangeStatusModal } from "./change-status-modal";
import { LogCallModal } from "./log-call-modal";
import { LogMeetingModal } from "./log-meeting-modal";
import { Section } from "./section";
import { TagEditor } from "./tag-editor";

interface CrmTabProps {
  contact: Contact;
  onNavigateToOutreach?: (outreachUuid: string) => void;
}

export function CrmTab({ contact, onNavigateToOutreach }: CrmTabProps) {
  const updateStatus = useUpdateContactStatus();
  const updateNotes = useUpdateContactNotes();
  const updateTags = useUpdateContactTags();
  const rescore = useRescoreContact();

  const [notes, setNotes] = useState(contact.notes ?? "");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [logCallOpen, setLogCallOpen] = useState(false);
  const [logMeetingOpen, setLogMeetingOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setNotes(contact.notes ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, [contact.uuid, contact.notes]);

  const notesDirty = (contact.notes ?? "") !== notes;

  const handleTagsChange = (next: string[]) => updateTags.mutate({ uuid: contact.uuid, tags: next });

  const pendingStatusLabel = pendingStatus ? (STATUS_OPTIONS.find((o) => o.id === pendingStatus)?.label ?? pendingStatus) : "";

  const handleStatusModalOpenChange = (open: boolean) => {
    setStatusModalOpen(open);
    if (!open) {
      setPendingStatus(null);
      setStatusNote("");
    }
  };

  const handleCancelStatus = () => {
    setStatusModalOpen(false);
    setPendingStatus(null);
    setStatusNote("");
  };

  const handleConfirmStatus = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(
      {
        uuid: contact.uuid,
        status: pendingStatus,
        note: statusNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          setStatusModalOpen(false);
          setPendingStatus(null);
          setStatusNote("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <ChangeStatusModal
        isOpen={statusModalOpen}
        onOpenChange={handleStatusModalOpenChange}
        pendingStatus={pendingStatus}
        pendingStatusLabel={pendingStatusLabel}
        statusNote={statusNote}
        onStatusNoteChange={setStatusNote}
        onCancel={handleCancelStatus}
        onConfirm={handleConfirmStatus}
        isPending={updateStatus.isPending}
      />

      <Section
        title="CRM state"
        action={
          <Button size="sm" variant="tertiary" isDisabled={rescore.isPending} isPending={rescore.isPending} onPress={() => rescore.mutate(contact)}>
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
              onChange={(v) => {
                const next = v as LeadStatus;
                if (next === contact.status) return;
                setPendingStatus(next);
                setStatusNote("");
                setStatusModalOpen(true);
              }}
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
          <TextArea id="contact-notes" aria-label="CRM notes" placeholder="Internal notes about this contact — next steps, context, call outcomes…" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
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

      <Section
        title="Activity"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="tertiary" onPress={() => setLogCallOpen(true)}>
              <Phone className="size-3.5" />
              Log call
            </Button>
            <Button size="sm" variant="tertiary" onPress={() => setLogMeetingOpen(true)}>
              <CalendarDays className="size-3.5" />
              Log meeting
            </Button>
          </div>
        }
      >
        <InteractionTimeline contactUuid={contact.uuid} onNavigateToOutreach={onNavigateToOutreach} />
      </Section>

      <LogCallModal
        contactUuid={contact.uuid}
        isOpen={logCallOpen}
        onOpenChange={setLogCallOpen}
      />
      <LogMeetingModal
        contactUuid={contact.uuid}
        isOpen={logMeetingOpen}
        onOpenChange={setLogMeetingOpen}
      />
    </div>
  );
}
