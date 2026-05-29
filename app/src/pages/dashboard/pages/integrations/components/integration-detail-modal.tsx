import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@heroui/react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteIntegrationCredential } from "@/features/integrations/hooks/use-integrations";
import type {
    IntegrationCredential,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";
import { groupCredentialsByAccount } from "@/features/integrations/constants/integrations.catalog";
import { IntegrationCredentialFormModal } from "./integration-credential-form-modal";

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
    const deleteCredential = useDeleteIntegrationCredential();

    const [formOpen, setFormOpen] = useState(false);
    const [editingCredential, setEditingCredential] =
        useState<IntegrationCredential | null>(null);
    const [credentialToDelete, setCredentialToDelete] =
        useState<IntegrationCredential | null>(null);

    const groupedCredentials = useMemo(
        () =>
            providerView
                ? groupCredentialsByAccount(providerView.credentials)
                : [],
        [providerView],
    );

    useEffect(() => {
        if (!isOpen) return;
        setEditingCredential(null);
        setCredentialToDelete(null);
    }, [isOpen]);

    if (!providerView) {
        return null;
    }

    const openCreate = () => {
        setEditingCredential(null);
        setFormOpen(true);
    };

    const openEdit = (credential: IntegrationCredential) => {
        setEditingCredential(credential);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!credentialToDelete) return;
        try {
            await deleteCredential.mutateAsync(credentialToDelete.uuid);
            setCredentialToDelete(null);
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
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Credentials
                                    </h3>
                                    <Button size="sm" onPress={openCreate}>
                                        <Plus className="size-4" />
                                        Add credential
                                    </Button>
                                </div>

                                {groupedCredentials.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
                                        No credentials yet. Add one to connect{" "}
                                        {providerView.label}.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {groupedCredentials.map((group) => (
                                            <section
                                                key={group.account}
                                                className="rounded-lg border border-border bg-surface-secondary/20"
                                            >
                                                <div className="px-3 py-2 border-b border-border">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                                                        Account
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {group.account}
                                                    </p>
                                                </div>
                                                <ul className="divide-y divide-border">
                                                    {group.credentials.map((credential) => (
                                                        <li
                                                            key={credential.uuid}
                                                            className="flex items-center gap-3 px-3 py-2.5"
                                                        >
                                                            <KeyRound className="size-4 text-accent shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {credential.label}
                                                                </p>
                                                                <p className="text-xs text-muted font-mono truncate">
                                                                    {credential.env_name}
                                                                    {credential.last4
                                                                        ? ` · •••• ${credential.last4}`
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onPress={() =>
                                                                        openEdit(credential)
                                                                    }
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onPress={() =>
                                                                        setCredentialToDelete(
                                                                            credential,
                                                                        )
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

            <IntegrationCredentialFormModal
                isOpen={formOpen}
                onOpenChange={setFormOpen}
                provider={providerView.provider}
                credential={editingCredential}
            />

            <ConfirmDialog
                isOpen={!!credentialToDelete}
                onOpenChange={(open) => {
                    if (!open) setCredentialToDelete(null);
                }}
                title="Delete credential?"
                description={
                    credentialToDelete ? (
                        <>
                            Remove{" "}
                            <span className="font-medium text-foreground">
                                {credentialToDelete.env_name}
                            </span>
                            ? This cannot be undone.
                        </>
                    ) : null
                }
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteCredential.isPending}
                onConfirm={handleDelete}
            />
        </>
    );
}
