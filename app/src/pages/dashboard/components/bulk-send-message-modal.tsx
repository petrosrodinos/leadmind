import { useEffect, useState } from "react";
import { Button, Modal } from "@heroui/react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ComposeMessageForm } from "@/features/messaging/components/compose-message-form";
import { ContactSelectionTable } from "@/pages/dashboard/components/contact-selection-table";

type BulkSendMessageStep = "recipients" | "compose";

export interface BulkSendMessageModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contacts: Contact[];
    onComplete?: () => void;
}

export function BulkSendMessageModal({
    isOpen,
    onOpenChange,
    contacts,
    onComplete,
}: BulkSendMessageModalProps) {
    const [step, setStep] = useState<BulkSendMessageStep>("recipients");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [composeMountKey, setComposeMountKey] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        setStep("recipients");
        setSelected(new Set(contacts.map((c) => c.uuid)));
    }, [isOpen, contacts]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setStep("recipients");
        }
        onOpenChange(open);
    };

    const toggleSelect = (uuid: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    };

    const toggleAll = (uuids: string[], select: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            for (const id of uuids) {
                if (select) next.add(id);
                else next.delete(id);
            }
            return next;
        });
    };

    const handleContinue = () => {
        if (selected.size === 0) return;
        setComposeMountKey((k) => k + 1);
        setStep("compose");
    };

    const selectedUuids = [...selected];
    const canRender = isOpen && contacts.length > 0;

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    {canRender && step === "recipients" ? (
                        <>
                            <Modal.Header>
                                <Modal.Heading>Send messages</Modal.Heading>
                                <p className="text-sm text-muted mt-1">
                                    Review recipients before composing your message.
                                </p>
                            </Modal.Header>
                            <Modal.Body className="p-6">
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-muted">
                                        {selected.size} of {contacts.length} contact
                                        {contacts.length === 1 ? "" : "s"} selected
                                    </p>
                                    <ContactSelectionTable
                                        rows={contacts}
                                        selected={selected}
                                        onToggleSelect={toggleSelect}
                                        onToggleAll={toggleAll}
                                    />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button slot="close" variant="secondary" type="button">
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="button"
                                    isDisabled={selected.size === 0}
                                    onPress={handleContinue}
                                >
                                    Continue
                                </Button>
                            </Modal.Footer>
                        </>
                    ) : null}
                    {canRender && step === "compose" ? (
                        <ComposeMessageForm
                            key={composeMountKey}
                            mode="bulk"
                            contactUuids={selectedUuids}
                            onClose={() => handleOpenChange(false)}
                            onBulkComplete={onComplete}
                            onBack={() => setStep("recipients")}
                        />
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
