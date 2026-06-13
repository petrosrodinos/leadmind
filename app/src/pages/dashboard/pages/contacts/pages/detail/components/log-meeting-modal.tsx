import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useLogMeeting } from "@/features/contacts/hooks/use-contacts";
import { MeetingOutcome, type LogMeetingPayload } from "@/features/contacts/interfaces/contact.interface";
import { cn } from "@/lib/utils";

interface LogMeetingModalProps {
  contactUuid: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextHalfHour(): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  if (m === 0 || m === 30) return d;
  if (m < 30) d.setMinutes(30);
  else {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
  }
  return d;
}

const MEETING_OUTCOME_OPTIONS: { id: MeetingOutcome; label: string }[] = [
  { id: MeetingOutcome.SCHEDULED, label: "Scheduled" },
  { id: MeetingOutcome.COMPLETED, label: "Completed" },
  { id: MeetingOutcome.NO_SHOW, label: "No show" },
  { id: MeetingOutcome.CANCELLED, label: "Cancelled" },
  { id: MeetingOutcome.CLOSED_WON, label: "Closed won" },
  { id: MeetingOutcome.CLOSED_LOST, label: "Closed lost" },
];

export function LogMeetingModal({ contactUuid, isOpen, onOpenChange }: LogMeetingModalProps) {
  const logMeeting = useLogMeeting();
  const [outcome, setOutcome] = useState<MeetingOutcome>(MeetingOutcome.SCHEDULED);
  const [occurredAt, setOccurredAt] = useState<string>(() => toLocalDatetimeValue(nextHalfHour()));
  const [duration, setDuration] = useState<string>("30");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setOutcome(MeetingOutcome.SCHEDULED);
      setOccurredAt(toLocalDatetimeValue(nextHalfHour()));
      setDuration("30");
      setLocation("");
      setNotes("");
    }
  }, [isOpen]);

  const occurredAtValid = (() => {
    if (!occurredAt) return false;
    const dt = new Date(occurredAt);
    return !isNaN(dt.getTime());
  })();

  const handleConfirm = () => {
    if (!occurredAtValid) return;
    const dt = new Date(occurredAt);
    const payload: LogMeetingPayload = {
      outcome,
      occurred_at: dt.toISOString(),
    };
    const durNum = duration === "" ? undefined : Number(duration);
    if (durNum !== undefined && Number.isFinite(durNum) && durNum >= 0) {
      payload.duration_minutes = Math.floor(durNum);
    }
    const trimmedLocation = location.trim();
    if (trimmedLocation) payload.location = trimmedLocation;
    const trimmedNotes = notes.trim();
    if (trimmedNotes) payload.content = trimmedNotes;

    logMeeting.mutate(
      { uuid: contactUuid, payload },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Log meeting</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label>Outcome</Label>
              <div className="grid grid-cols-2 gap-2">
                {MEETING_OUTCOME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOutcome(opt.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      outcome === opt.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-foreground hover:bg-surface-secondary",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="log-meeting-when">When</Label>
                <Input
                  id="log-meeting-when"
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="log-meeting-duration">Duration (min)</Label>
                <Input
                  id="log-meeting-duration"
                  type="number"
                  min={0}
                  max={1440}
                  placeholder="e.g. 30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-meeting-location">Location</Label>
              <Input
                id="log-meeting-location"
                type="text"
                placeholder="Zoom link, address, or 'Office'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-meeting-notes">Notes</Label>
              <TextArea
                id="log-meeting-notes"
                rows={4}
                placeholder="Agenda, outcome, next steps…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="gap-2 justify-end">
            <Button size="sm" variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ActionButtonWithPending
              size="sm"
              variant="secondary"
              isDisabled={!occurredAtValid}
              isPending={logMeeting.isPending}
              onPress={handleConfirm}
            >
              Save meeting
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
