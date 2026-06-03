import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
  CallDirection,
  type LogSmsPayload,
} from "@/features/contacts/interfaces/contact.interface";
import { useLogSms } from "@/features/contacts/hooks/use-contacts";
import { cn } from "@/lib/utils";

interface LogSmsModalProps {
  contactUuid: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIRECTIONS: { id: CallDirection; label: string }[] = [
  { id: CallDirection.OUTBOUND, label: "Outbound" },
  { id: CallDirection.INBOUND, label: "Inbound" },
];

function toLocalDatetimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogSmsModal({ contactUuid, isOpen, onOpenChange }: LogSmsModalProps) {
  const logSms = useLogSms();
  const [direction, setDirection] = useState<CallDirection>(CallDirection.OUTBOUND);
  const [occurredAt, setOccurredAt] = useState<string>(() => toLocalDatetimeValue(new Date()));
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setDirection(CallDirection.OUTBOUND);
      setOccurredAt(toLocalDatetimeValue(new Date()));
      setContent("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const payload: LogSmsPayload = { direction };
    if (occurredAt) {
      const dt = new Date(occurredAt);
      if (!isNaN(dt.getTime())) {
        payload.occurred_at = dt.toISOString();
      }
    }
    const trimmedContent = content.trim();
    if (trimmedContent) payload.content = trimmedContent;

    logSms.mutate(
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
            <Modal.Heading>Log SMS</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-6 space-y-4">
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-sms-when">When</Label>
              <Input
                id="log-sms-when"
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-sms-content">Message</Label>
              <TextArea
                id="log-sms-content"
                rows={4}
                placeholder="SMS content or summary…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
              isDisabled={logSms.isPending}
              isPending={logSms.isPending}
              onPress={handleConfirm}
            >
              Save SMS
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
