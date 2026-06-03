import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
  CallDirection,
  type LogEmailPayload,
} from "@/features/contacts/interfaces/contact.interface";
import { useLogEmail } from "@/features/contacts/hooks/use-contacts";
import { cn } from "@/lib/utils";

interface LogEmailModalProps {
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

export function LogEmailModal({ contactUuid, isOpen, onOpenChange }: LogEmailModalProps) {
  const logEmail = useLogEmail();
  const [direction, setDirection] = useState<CallDirection>(CallDirection.OUTBOUND);
  const [subject, setSubject] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(() => toLocalDatetimeValue(new Date()));
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setDirection(CallDirection.OUTBOUND);
      setSubject("");
      setOccurredAt(toLocalDatetimeValue(new Date()));
      setContent("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const payload: LogEmailPayload = { direction };
    const trimmedSubject = subject.trim();
    if (trimmedSubject) payload.subject = trimmedSubject;
    if (occurredAt) {
      const dt = new Date(occurredAt);
      if (!isNaN(dt.getTime())) {
        payload.occurred_at = dt.toISOString();
      }
    }
    const trimmedContent = content.trim();
    if (trimmedContent) payload.content = trimmedContent;

    logEmail.mutate(
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
            <Modal.Heading>Log email</Modal.Heading>
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
              <Label htmlFor="log-email-subject">Subject</Label>
              <Input
                id="log-email-subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-email-when">When</Label>
              <Input
                id="log-email-when"
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-email-content">Message</Label>
              <TextArea
                id="log-email-content"
                rows={4}
                placeholder="Email body or summary…"
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
              isDisabled={logEmail.isPending}
              isPending={logEmail.isPending}
              onPress={handleConfirm}
            >
              Save email
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
