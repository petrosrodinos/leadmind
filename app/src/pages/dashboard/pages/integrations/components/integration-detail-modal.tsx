import { useEffect, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteIntegrationKey } from "@/features/integrations/hooks/use-integrations";
import type {
    Integration,
    IntegrationKey,
} from "@/features/integrations/interfaces/integrations.interface";
import { integrationProviderMeta } from "@/features/integrations/constants/integration-providers";
import { IntegrationKeyFormModal } from "./integration-key-form-modal";

interface IntegrationDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    integration: Integration | null;
}

export function IntegrationDetailModal({
    isOpen,
    onOpenChange,
    integration,
}: IntegrationDetailModalProps) {
    const provider = integration?.provider;
    const meta = provider ? integrationProviderMeta[provider] : null;
    const deleteKey = useDeleteIntegrationKey();

    const [keyFormOpen, setKeyFormOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
    const [keyToDelete, setKeyToDelete] = useState<IntegrationKey | null>(null);

    useEffect(() => {
        if (!isOpen || !integration) return;
        setEditingKey(null);
        setKeyToDelete(null);
    }, [isOpen, integration]);

    if (!integration || !provider || !meta) {
        return null;
    }

    const handleDeleteKey = async () => {
        if (!keyToDelete) return;
        try {
            await deleteKey.mutateAsync(keyToDelete.uuid);
            setKeyToDelete(null);
        } catch {
        }
    };

    const openAddKey = () => {
        setEditingKey(null);
        setKeyFormOpen(true);
    };

    const openEditKey = (key: IntegrationKey) => {
        setEditingKey(key);
        setKeyFormOpen(true);
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <Modal.Backdrop>
                    <Modal.Container size="lg">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>{meta.label}</Modal.Heading>
                                <p className="text-sm text-muted font-normal">
                                    {meta.description}
                                </p>
                            </Modal.Header>
                            <Modal.Body className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Keys
                                    </h3>
                                    <Button size="sm" onPress={openAddKey}>
                                        <Plus className="size-4" />
                                        Add key
                                    </Button>
                                </div>

                                {integration.keys.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
                                        No keys yet. Add one to store credentials
                                        for {meta.label}.
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {integration.keys.map((key) => (
                                            <li
                                                key={key.uuid}
                                                className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary/40 px-3 py-2.5"
                                            >
                                                <KeyRound className="size-4 text-accent shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {key.title}
                                                    </p>
                                                    <p className="text-xs text-muted font-mono">
                                                        {key.last4
                                                            ? `•••• ${key.last4}`
                                                            : "••••••••"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onPress={() =>
                                                            openEditKey(key)
                                                        }
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onPress={() =>
                                                            setKeyToDelete(key)
                                                        }
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onPress={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <IntegrationKeyFormModal
                isOpen={keyFormOpen}
                onOpenChange={setKeyFormOpen}
                provider={provider}
                keyItem={editingKey}
            />

            <ConfirmDialog
                isOpen={!!keyToDelete}
                onOpenChange={(open) => {
                    if (!open) setKeyToDelete(null);
                }}
                title="Delete key?"
                description={
                    keyToDelete ? (
                        <>
                            Remove{" "}
                            <span className="font-medium text-foreground">
                                {keyToDelete.title}
                            </span>
                            ? This cannot be undone.
                        </>
                    ) : null
                }
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteKey.isPending}
                onConfirm={handleDeleteKey}
            />
        </>
    );
}
