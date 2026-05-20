import type { FC } from "react";
import { Button, Modal } from "@heroui/react";

interface JobErrorModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    error: string | null;
    startedAt?: string;
}

export const JobErrorModal: FC<JobErrorModalProps> = ({
    isOpen,
    onOpenChange,
    error,
    startedAt,
}) => {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Job error</Modal.Heading>
                        {startedAt && (
                            <p className="text-sm text-muted font-normal mt-1">
                                Started {new Date(startedAt).toLocaleString()}
                            </p>
                        )}
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        <pre className="text-sm text-danger whitespace-pre-wrap break-words font-mono max-h-[min(60vh,480px)] overflow-y-auto rounded-lg border border-border bg-surface-secondary p-4">
                            {error}
                        </pre>
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button size="sm" variant="tertiary" onPress={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
