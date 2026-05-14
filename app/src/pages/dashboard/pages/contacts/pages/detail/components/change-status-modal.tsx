import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { Button, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingStatus: LeadStatus | null;
  pendingStatusLabel: string;
  statusNote: string;
  onStatusNoteChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ChangeStatusModal({
  isOpen,
  onOpenChange,
  pendingStatus,
  pendingStatusLabel,
  statusNote,
  onStatusNoteChange,
  onCancel,
  onConfirm,
  isPending,
}: ChangeStatusModalProps) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Change status</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-6 space-y-4">
            <p className="text-sm text-foreground">
              Set status to <span className="font-medium">{pendingStatusLabel}</span>. This is recorded on the contact timeline.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status-change-note">Note (optional)</Label>
              <TextArea id="status-change-note" rows={4} placeholder="Context for this change…" value={statusNote} onChange={(e) => onStatusNoteChange(e.target.value)} />
            </div>
          </Modal.Body>
          <Modal.Footer className="gap-2 justify-end">
            <Button size="sm" variant="tertiary" onPress={onCancel}>
              Cancel
            </Button>
            <ActionButtonWithPending size="sm" variant="secondary" isDisabled={pendingStatus === null} isPending={isPending} onPress={onConfirm}>
              Save status
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
