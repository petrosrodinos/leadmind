import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteIntegrationKey } from "@/features/integrations/hooks/use-integrations";
import {
    groupKeysByAccount,
    canShowAddKeyButton,
    providerAllowsMultipleAccounts,
} from "@/features/integrations/constants/integration-key-types";
import type {
    IntegrationKey,
    IntegrationKeyType,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";
import { IntegrationKeyFormModal } from "./integration-key-form-modal";

interface IntegrationDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    providerView: IntegrationProviderView | null;
}

export function IntegrationDetailModal({
    isOpen,
    onOpenChange,
    providerView,
}: IntegrationDetailModalProps) {
    const deleteKey = useDeleteIntegrationKey();

    const [formOpen, setFormOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
    const [initialKeyType, setInitialKeyType] = useState<
        IntegrationKeyType | undefined
    >();
    const [keyToDelete, setKeyToDelete] = useState<IntegrationKey | null>(null);

    const groupedKeys = useMemo(
        () => (providerView ? groupKeysByAccount(providerView.keys) : []),
        [providerView],
    );

    useEffect(() => {
        if (!isOpen) return;
        setEditingKey(null);
        setInitialKeyType(undefined);
        setKeyToDelete(null);
    }, [isOpen]);

    if (!providerView) {
        return null;
    }

    const allowsMultipleAccounts =
        providerView.allows_multiple_accounts ??
        providerAllowsMultipleAccounts(providerView.provider);

    const canAddKey = canShowAddKeyButton(providerView);
    const canAddWebhookSecret =
        providerView.keyTypes.some((row) => row.key_type === "WEBHOOK_SECRET") &&
        (allowsMultipleAccounts ||
            !providerView.keys.some((key) => key.key_type === "WEBHOOK_SECRET"));

    const openCreate = (keyType?: IntegrationKeyType) => {
        setEditingKey(null);
        setInitialKeyType(keyType);
        setFormOpen(true);
    };

    const openEdit = (key: IntegrationKey) => {
        setEditingKey(key);
        setInitialKeyType(undefined);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!keyToDelete) return;
        try {
            await deleteKey.mutateAsync(keyToDelete.uuid);
            setKeyToDelete(null);
        } catch {
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <Modal.Backdrop>
                    <Modal.Container size="lg">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>{providerView.label}</Modal.Heading>
                                <p className="text-sm text-muted font-normal">
                                    {providerView.description}
                                </p>
                            </Modal.Header>
                            <Modal.Body className="space-y-5">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Keys
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {canAddWebhookSecret && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onPress={() =>
                                                    openCreate("WEBHOOK_SECRET")
                                                }
                                            >
                                                Add webhook secret
                                            </Button>
                                        )}
                                        {canAddKey && (
                                            <Button size="sm" onPress={() => openCreate()}>
                                                <Plus className="size-4" />
                                                Add key
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {groupedKeys.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
                                        No keys yet. Add an API key or webhook secret
                                        for {providerView.label}.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {groupedKeys.map((group) => (
                                            <section
                                                key={group.account}
                                                className="rounded-lg border border-border bg-surface-secondary/20"
                                            >
                                                {allowsMultipleAccounts && (
                                                    <div className="px-3 py-2 border-b border-border">
                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted">
                                                            Account
                                                        </p>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {group.account}
                                                        </p>
                                                    </div>
                                                )}
                                                <ul className="divide-y divide-border">
                                                    {group.keys.map((key) => (
                                                        <li
                                                            key={key.uuid}
                                                            className="flex items-center gap-3 px-3 py-2.5"
                                                        >
                                                            <KeyRound className="size-4 text-accent shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {key.label}
                                                                </p>
                                                                <p className="text-xs text-muted font-mono truncate">
                                                                    {key.env_name}
                                                                    {key.last4
                                                                        ? ` · •••• ${key.last4}`
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onPress={() =>
                                                                        openEdit(key)
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
                                            </section>
                                        ))}
                                    </div>
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
                isOpen={formOpen}
                onOpenChange={setFormOpen}
                providerView={providerView}
                keyItem={editingKey}
                initialKeyType={initialKeyType}
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
                                {keyToDelete.env_name}
                            </span>
                            ? This cannot be undone.
                        </>
                    ) : null
                }
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteKey.isPending}
                onConfirm={handleDelete}
            />
        </>
    );
}
