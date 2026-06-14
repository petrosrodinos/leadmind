import { useState } from "react";
import { Modal } from "@heroui/react";
import {
    ComposeMessageForm,
    type ComposeMessageMode,
} from "@/features/messaging/components/compose-message-form";

export interface ComposeMessageModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: ComposeMessageMode;
    contactUuid?: string;
    contactUuids?: string[];
    onBulkComplete?: () => void;
}

export function ComposeMessageModal({
    isOpen,
    onOpenChange,
    mode = "single",
    contactUuid,
    contactUuids,
    onBulkComplete,
}: ComposeMessageModalProps) {
    const [mountKey, setMountKey] = useState(0);

    const handleOpenChange = (open: boolean) => {
        if (open) setMountKey((k) => k + 1);
        onOpenChange(open);
    };

    const canRender =
        isOpen &&
        (mode === "bulk" ? (contactUuids?.length ?? 0) > 0 : Boolean(contactUuid));

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    {canRender ? (
                        <ComposeMessageForm
                            key={mountKey}
                            mode={mode}
                            contactUuid={contactUuid}
                            contactUuids={contactUuids}
                            onClose={() => onOpenChange(false)}
                            onBulkComplete={onBulkComplete}
                        />
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
