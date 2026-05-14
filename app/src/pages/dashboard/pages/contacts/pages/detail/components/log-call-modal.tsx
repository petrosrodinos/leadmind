import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
  CallDirection,
  CallOutcome,
  type LogCallPayload,
} from "@/features/contacts/interfaces/contact.interface";
import { useLogCall } from "@/features/contacts/hooks/use-contacts";
import { cn } from "@/lib/utils";

interface LogCallModalProps {
  contactUuid: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const OUTCOMES: { id: CallOutcome; label: string }[] = [
  { id: CallOutcome.CONNECTED, label: "Connected" },
  { id: CallOutcome.NO_ANSWER, label: "No answer" },
  { id: CallOutcome.VOICEMAIL, label: "Voicemail" },
  { id: CallOutcome.BUSY, label: "Busy" },
];

const DIRECTIONS: { id: CallDirection; label: string }[] = [
  { id: CallDirection.OUTBOUND, label: "Outbound" },
  { id: CallDirection.INBOUND, label: "Inbound" },
];

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogCallModal({ contactUuid, isOpen, onOpenChange }: LogCallModalProps) {
  const logCall = useLogCall();
  const [outcome, setOutcome] = useState<CallOutcome>(CallOutcome.CONNECTED);
  const [direction, setDirection] = useState<CallDirection>(CallDirection.OUTBOUND);
  const [duration, setDuration] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(() => toLocalDatetimeValue(new Date()));
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setOutcome(CallOutcome.CONNECTED);
      setDirection(CallDirection.OUTBOUND);
      setDuration("");
      setOccurredAt(toLocalDatetimeValue(new Date()));
      setNotes("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const payload: LogCallPayload = {
      outcome,
      direction,
    };
    const durNum = duration === "" ? undefined : Number(duration);
    if (durNum !== undefined && Number.isFinite(durNum) && durNum >= 0) {
      payload.duration_minutes = Math.floor(durNum);
    }
    if (occurredAt) {
      const dt = new Date(occurredAt);
      if (!isNaN(dt.getTime())) {
        payload.occurred_at = dt.toISOString();
      }
    }
    const trimmedNotes = notes.trim();
    if (trimmedNotes) payload.content = trimmedNotes;

    logCall.mutate(
      { uuid: contactUuid, payload },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  const durationEnabled = outcome === CallOutcome.CONNECTED;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Log call</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label>Outcome</Label>
              <div className="grid grid-cols-2 gap-2">
                {OUTCOMES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOutcome(o.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      outcome === o.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-foreground hover:bg-surface-secondary",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Direction</Label>
              <div className="grid grid-cols-2 gap-2">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDirection(d.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      direction === d.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-foreground hover:bg-surface-secondary",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="log-call-duration">Duration (min)</Label>
                <Input
                  id="log-call-duration"
                  type="number"
                  min={0}
                  max={1440}
                  placeholder="e.g. 12"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={!durationEnabled}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="log-call-occurred-at">When</Label>
                <Input
                  id="log-call-occurred-at"
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-call-notes">Notes</Label>
              <TextArea
                id="log-call-notes"
                rows={4}
                placeholder="What was discussed, next steps…"
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
              isDisabled={logCall.isPending}
              isPending={logCall.isPending}
              onPress={handleConfirm}
            >
              Save call
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
