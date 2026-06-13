import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCreateContactList, useUpdateContactList } from "@/features/contact-lists/hooks/use-contact-lists";
import type { ContactList } from "@/features/contact-lists/interfaces/contact-list.interface";
import { Routes } from "@/routes/routes";

interface ContactListFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: ContactList | null;
}

export function ContactListFormModal({ isOpen, onOpenChange, editing }: ContactListFormModalProps) {
  const navigate = useNavigate();
  const createList = useCreateContactList();
  const updateList = useUpdateContactList();
  const isPending = createList.isPending || updateList.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description ?? "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [isOpen, editing]);

  const handleConfirm = () => {
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
    };
    if (editing) {
      updateList.mutate({ uuid: editing.uuid, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createList.mutate(payload, {
        onSuccess: (list) => {
          onOpenChange(false);
          navigate(Routes.dashboard.lists_detail.replace(":uuid", list.uuid));
        },
      });
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{editing ? "Edit List" : "New List"}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="list-title">
                Title <span className="text-danger">*</span>
              </Label>
              <Input id="list-title" placeholder="e.g. Accountants List" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="list-description">Description</Label>
              <TextArea id="list-description" placeholder="Optional notes about this list…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </Modal.Body>
          <Modal.Footer className="gap-2 justify-end">
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ActionButtonWithPending isPending={isPending} isDisabled={!title.trim() || isPending} onPress={handleConfirm}>
              {editing ? "Save" : "Create List"}
            </ActionButtonWithPending>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
