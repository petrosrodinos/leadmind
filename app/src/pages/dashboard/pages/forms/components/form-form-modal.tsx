import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCreateForm, useUpdateForm } from "@/features/forms/hooks/use-forms";
import type { Form } from "@/features/forms/interfaces/form.interface";
import { Routes } from "@/routes/routes";

interface FormFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editing?: Form | null;
}

export function FormFormModal({ isOpen, onOpenChange, editing }: FormFormModalProps) {
    const navigate = useNavigate();
    const createForm = useCreateForm();
    const updateForm = useUpdateForm();
    const isPending = createForm.isPending || updateForm.isPending;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        if (editing) {
            setName(editing.name);
            setDescription(editing.description ?? "");
        } else {
            setName("");
            setDescription("");
        }
    }, [isOpen, editing]);

    const handleConfirm = () => {
        const payload = { name: name.trim(), description: description.trim() || undefined };
        if (editing) {
            updateForm.mutate(
                { uuid: editing.uuid, payload },
                { onSuccess: () => onOpenChange(false) },
            );
        } else {
            createForm.mutate(payload, {
                onSuccess: (form) => {
                    onOpenChange(false);
                    navigate(Routes.dashboard.forms_detail.replace(":uuid", form.uuid));
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
                        <Modal.Heading>{editing ? "Edit Form" : "New Form"}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="form-name">
                                Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                                id="form-name"
                                placeholder="e.g. Sales Qualification Form"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="form-description">Description</Label>
                            <TextArea
                                id="form-description"
                                placeholder="Brief description of this form's purpose…"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            isPending={isPending}
                            isDisabled={!name.trim() || isPending}
                            onPress={handleConfirm}
                        >
                            {editing ? "Save" : "Create Form"}
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
