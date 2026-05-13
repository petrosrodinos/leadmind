import { useEffect, useState } from "react";
import { Button, Dropdown, ListBox, Select, TextArea, Tooltip } from "@heroui/react";
import { CalendarDays, ChevronDown, Info, Phone, Sparkles } from "lucide-react";
import type { Contact, LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";
import { useRescoreContact, useUpdateContactNotes, useUpdateContactStatus, useUpdateContactTags } from "@/features/contacts/hooks/use-contacts";
import { ScoreBadge } from "@/pages/dashboard/pages/leads/components/badges";
import { InteractionTimeline } from "@/pages/dashboard/pages/contacts/components/interaction-timeline";
import { ChangeStatusModal } from "./change-status-modal";
import { LogCallModal } from "./log-call-modal";
import { LogMeetingModal } from "./log-meeting-modal";
import { TagEditor } from "./tag-editor";

interface CrmTabProps {
  contact: Contact;
  onNavigateToOutreach?: (outreachUuid: string) => void;
}

const LABEL_CLASS = "text-xs font-semibold uppercase tracking-[0.12em] text-muted";

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

  const pendingStatusLabel = pendingStatus
    ? (STATUS_OPTIONS.find((o) => o.id === pendingStatus)?.label ?? pendingStatus)
    : "";

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
      { uuid: contact.uuid, status: pendingStatus, note: statusNote.trim() || undefined },
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
    <div className="flex flex-col gap-5 max-w-3xl">
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

      {/* CRM State */}
      <div className="rounded-2xl border border-border/80 bg-surface/80">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-foreground">CRM State</h3>
          <Button
            size="sm"
            variant="tertiary"
            isDisabled={rescore.isPending}
            isPending={rescore.isPending}
            onPress={() => rescore.mutate(contact)}
          >
            <Sparkles className="size-3.5" />
            Rescore
          </Button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div className="flex flex-wrap gap-5">
            <div className="flex-1 min-w-[180px] flex flex-col gap-2">
              <p className={LABEL_CLASS}>Status</p>
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <p className={LABEL_CLASS}>AI Score</p>
                {contact.filter?.scoring_instructions ? (
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Info className="size-3 text-muted cursor-default" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-xs text-xs whitespace-pre-line">
                      {contact.filter.scoring_instructions}
                    </Tooltip.Content>
                  </Tooltip>
                ) : null}
              </div>
              <div className="flex items-center h-full pt-0.5">
                <ScoreBadge score={contact.score} />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50" />

          <div className="flex flex-col gap-2">
            <p className={LABEL_CLASS}>Tags</p>
            <TagEditor tags={contact.tags} onChange={handleTagsChange} disabled={updateTags.isPending} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-border/80 bg-surface/80">
        <div className="border-b border-border/60 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <TextArea
            id="contact-notes"
            aria-label="CRM notes"
            placeholder="Internal notes about this contact — next steps, context, call outcomes…"
            rows={7}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted/50 transition-opacity duration-150" style={{ opacity: notesDirty ? 1 : 0 }}>
              Unsaved changes
            </span>
            <Button
              size="sm"
              variant="secondary"
              isDisabled={!notesDirty || updateNotes.isPending}
              isPending={updateNotes.isPending}
              onPress={() => updateNotes.mutate({ uuid: contact.uuid, notes })}
            >
              Save notes
            </Button>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-2xl border border-border/80 bg-surface/80">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-foreground">Activity</h3>
          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button size="sm" variant="tertiary">
                Log activity
                <ChevronDown className="size-3.5" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "call") setLogCallOpen(true);
                  if (key === "meeting") setLogMeetingOpen(true);
                }}
              >
                <Dropdown.Item id="call" textValue="Log call">
                  <Phone className="size-4" />
                  Log call
                </Dropdown.Item>
                <Dropdown.Item id="meeting" textValue="Log meeting">
                  <CalendarDays className="size-4" />
                  Log meeting
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        <div className="px-5 py-4">
          <InteractionTimeline contactUuid={contact.uuid} onNavigateToOutreach={onNavigateToOutreach} />
        </div>
      </div>

      <LogCallModal contactUuid={contact.uuid} isOpen={logCallOpen} onOpenChange={setLogCallOpen} />
      <LogMeetingModal contactUuid={contact.uuid} isOpen={logMeetingOpen} onOpenChange={setLogMeetingOpen} />
    </div>
  );
}
