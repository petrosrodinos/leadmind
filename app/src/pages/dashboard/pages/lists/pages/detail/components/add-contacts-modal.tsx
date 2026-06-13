import { Modal } from "@heroui/react";
import { AddContactsPanel } from "./add-contacts-panel";

interface AddContactsModalProps {
    listUuid: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddContactsModal({ listUuid, isOpen, onOpenChange }: AddContactsModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-4xl w-full">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Add contacts</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        <p className="text-sm text-muted">
                            Filter your contacts, then add selected rows or all matching results.
                        </p>
                        {isOpen ? (
                            <AddContactsPanel
                                listUuid={listUuid}
                                showHeader={false}
                                onAdded={() => onOpenChange(false)}
                            />
                        ) : null}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
