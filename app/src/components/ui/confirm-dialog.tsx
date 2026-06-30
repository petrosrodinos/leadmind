import { AlertDialog, Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";

type ConfirmVariant = "danger" | "default";

interface ConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
    isPending?: boolean;
    isConfirmDisabled?: boolean;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    isPending = false,
    isConfirmDisabled = false,
    onConfirm,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
        if (!isPending) onOpenChange(false);
    };

    return (
        <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-md">
                    <AlertDialog.Header>
                        <AlertDialog.Icon
                            status={variant === "danger" ? "danger" : "warning"}
                        >
                            <AlertTriangle className="size-5" />
                        </AlertDialog.Icon>
                        <AlertDialog.Heading>{title}</AlertDialog.Heading>
                    </AlertDialog.Header>
                    {description ? (
                        <AlertDialog.Body>
                            <div className="text-sm text-muted">{description}</div>
                        </AlertDialog.Body>
                    ) : null}
                    <AlertDialog.Footer>
                        <Button
                            slot="close"
                            variant="secondary"
                            isDisabled={isPending}
                        >
                            {cancelLabel}
                        </Button>
                        <ActionButtonWithPending
                            variant={variant === "danger" ? "danger" : "primary"}
                            isDisabled={isPending || isConfirmDisabled}
                            isPending={isPending}
                            onPress={handleConfirm}
                        >
                            {confirmLabel}
                        </ActionButtonWithPending>
                    </AlertDialog.Footer>
                </AlertDialog.Dialog>
            </AlertDialog.Container>
        </AlertDialog.Backdrop>
    );
}
