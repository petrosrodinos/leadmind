import { useEffect, useState } from "react";
import { Button, FieldError, Input, Label, Modal } from "@heroui/react";
import { Save } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCreateIntegrationKey,
    useUpdateIntegrationKey,
} from "@/features/integrations/hooks/use-integrations";
import type {
    IntegrationKey,
    IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interface";
import { integrationProviderMeta } from "@/features/integrations/constants/integration-providers";

interface IntegrationKeyFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    provider: IntegrationProvider;
    keyItem?: IntegrationKey | null;
}

export function IntegrationKeyFormModal({
    isOpen,
    onOpenChange,
    provider,
    keyItem,
}: IntegrationKeyFormModalProps) {
    const meta = integrationProviderMeta[provider];
    const createKey = useCreateIntegrationKey();
    const updateKey = useUpdateIntegrationKey();
    const isEdit = !!keyItem;

    const [title, setTitle] = useState("");
    const [secret, setSecret] = useState("");
    const [titleError, setTitleError] = useState<string | null>(null);
    const [secretError, setSecretError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTitle(keyItem?.title ?? "");
        setSecret("");
        setTitleError(null);
        setSecretError(null);
    }, [isOpen, keyItem]);

    const pending = createKey.isPending || updateKey.isPending;

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedSecret = secret.trim();
        let valid = true;

        if (!trimmedTitle) {
            setTitleError("Title is required");
            valid = false;
        } else {
            setTitleError(null);
        }

        if (!isEdit && !trimmedSecret) {
            setSecretError("Secret is required");
            valid = false;
        } else if (isEdit && trimmedSecret.length === 0) {
            setSecretError(null);
        } else if (trimmedSecret) {
            setSecretError(null);
        }

        if (!valid) return;

        try {
            if (isEdit && keyItem) {
                await updateKey.mutateAsync({
                    keyUuid: keyItem.uuid,
                    payload: {
                        title: trimmedTitle,
                        ...(trimmedSecret ? { secret: trimmedSecret } : {}),
                    },
                });
            } else {
                await createKey.mutateAsync({
                    provider,
                    payload: { title: trimmedTitle, secret: trimmedSecret },
                });
            }
            onOpenChange(false);
        } catch {
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>
                                {isEdit ? "Edit key" : `Add ${meta.label} key`}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="integration-key-title">Title</Label>
                                <Input
                                    id="integration-key-title"
                                    placeholder="Primary API key"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                {titleError && (
                                    <FieldError>{titleError}</FieldError>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="integration-key-secret">
                                    {meta.secretLabel}
                                </Label>
                                <Input
                                    id="integration-key-secret"
                                    type="password"
                                    autoComplete="off"
                                    placeholder={
                                        isEdit
                                            ? "Leave blank to keep current value"
                                            : meta.secretPlaceholder
                                    }
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                />
                                {secretError && (
                                    <FieldError>{secretError}</FieldError>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onPress={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <ActionButtonWithPending
                                isPending={pending}
                                onPress={handleSubmit}
                            >
                                <Save className="size-4" />
                                {isEdit ? "Save changes" : "Add key"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
