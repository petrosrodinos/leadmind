import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Modal } from "@heroui/react";
import { CheckCircle2, KeyRound, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    useDeleteIntegrationKey,
    useSetDefaultIntegrationAccount,
} from "@/features/integrations/hooks/use-integrations";
import {
    canShowAddKeyButton,
    formatIntegrationKeyDisplay,
    getMissingKeyTypesForAccount,
    groupKeysByAccount,
    isEmailAccountSendable,
    providerAllowsMultipleAccounts,
    providerSupportsDefaultAccountSelection,
    suggestNextAccountLabel,
} from "@/features/integrations/constants/integration-key-types";
import type {
    IntegrationKey,
    IntegrationKeyType,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";
import { IntegrationKeyFormModal } from "./integration-key-form-modal";
import { SmtpAccountFormModal } from "./smtp-account-form-modal";

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
    const setDefaultAccount = useSetDefaultIntegrationAccount();

    const [formOpen, setFormOpen] = useState(false);
    const [smtpFormOpen, setSmtpFormOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
    const [initialKeyType, setInitialKeyType] = useState<
        IntegrationKeyType | undefined
    >();
    const [initialAccount, setInitialAccount] = useState<string | undefined>();
    const [keyToDelete, setKeyToDelete] = useState<IntegrationKey | null>(null);

    const groupedKeys = useMemo(
        () => (providerView ? groupKeysByAccount(providerView.keys) : []),
        [providerView],
    );

    useEffect(() => {
        if (!isOpen) return;
        setEditingKey(null);
        setInitialKeyType(undefined);
        setInitialAccount(undefined);
        setKeyToDelete(null);
    }, [isOpen]);

    if (!providerView) {
        return null;
    }

    const allowsMultipleAccounts =
        providerView.allows_multiple_accounts ??
        providerAllowsMultipleAccounts(providerView.provider);

    const supportsDefaultAccountSelection =
        providerView.supports_default_account_selection ??
        providerSupportsDefaultAccountSelection(providerView.provider);

    const defaultAccount = providerView.default_account;
    const showDefaultAccountControls =
        supportsDefaultAccountSelection && groupedKeys.length > 1;

    const canAddKey = canShowAddKeyButton(providerView);
    const canAddAccount =
        allowsMultipleAccounts &&
        (providerView.provider === "RESEND" || providerView.provider === "SMTP");
    const canAddWebhookSecret =
        providerView.keyTypes.some((row) => row.key_type === "WEBHOOK_SECRET") &&
        (allowsMultipleAccounts ||
            !providerView.keys.some((key) => key.key_type === "WEBHOOK_SECRET"));

    const openCreate = (keyType?: IntegrationKeyType, account?: string) => {
        setEditingKey(null);
        setInitialKeyType(keyType);
        setInitialAccount(account);
        setFormOpen(true);
    };

    const openAddAccount = () => {
        if (!providerView) return;
        const nextAccount = suggestNextAccountLabel(providerView.keys);
        if (providerView.provider === "SMTP") {
            setSmtpFormOpen(true);
            return;
        }
        openCreate("API_KEY", nextAccount);
    };

    const openEdit = (key: IntegrationKey) => {
        setEditingKey(key);
        setInitialKeyType(undefined);
        setInitialAccount(undefined);
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

    const handleSetDefaultAccount = async (account: string) => {
        if (!providerView || account === defaultAccount) return;
        try {
            await setDefaultAccount.mutateAsync({
                provider: providerView.provider,
                payload: { account },
            });
        } catch {
        }
    };

    const accountIsSendable = (account: string) => {
        if (providerView.provider !== "RESEND" && providerView.provider !== "SMTP") {
            return null;
        }
        return isEmailAccountSendable(providerView.provider, providerView.keys, account);
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
                                        {canAddAccount && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onPress={openAddAccount}
                                            >
                                                <Plus className="size-4" />
                                                Add account
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
                                        No keys yet. Add credentials for{" "}
                                        {providerView.label}.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {groupedKeys.map((group) => {
                                            const isDefault =
                                                defaultAccount === group.account;
                                            const sendable = accountIsSendable(
                                                group.account,
                                            );
                                            const missingTypes =
                                                getMissingKeyTypesForAccount(
                                                    providerView.provider,
                                                    providerView.keys,
                                                    group.account,
                                                );

                                            return (
                                                <section
                                                    key={group.account}
                                                    className="rounded-lg border border-border bg-surface-secondary/20"
                                                >
                                                    {allowsMultipleAccounts && (
                                                        <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                                                                    Account
                                                                </p>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {group.account}
                                                                </p>
                                                                {sendable !== null ? (
                                                                    <p className="text-xs text-muted mt-0.5">
                                                                        {sendable
                                                                            ? "Ready to send email"
                                                                            : `Missing: ${missingTypes.join(", ").toLowerCase()}`}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {sendable ? (
                                                                    <Chip
                                                                        size="sm"
                                                                        variant="soft"
                                                                        color="success"
                                                                    >
                                                                        <Chip.Label className="inline-flex items-center gap-1">
                                                                            <CheckCircle2 className="size-3" />
                                                                            Sendable
                                                                        </Chip.Label>
                                                                    </Chip>
                                                                ) : null}
                                                                {supportsDefaultAccountSelection && (
                                                                    <>
                                                                        {isDefault ? (
                                                                            <Chip
                                                                                size="sm"
                                                                                variant="soft"
                                                                                color="warning"
                                                                            >
                                                                                <Chip.Label className="inline-flex items-center gap-1">
                                                                                    <Star className="size-3 fill-current" />
                                                                                    Default
                                                                                </Chip.Label>
                                                                            </Chip>
                                                                        ) : showDefaultAccountControls ? (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                isDisabled={
                                                                                    setDefaultAccount.isPending
                                                                                }
                                                                                onPress={() =>
                                                                                    handleSetDefaultAccount(
                                                                                        group.account,
                                                                                    )
                                                                                }
                                                                            >
                                                                                Set as default
                                                                            </Button>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <ul className="divide-y divide-border">
                                                        {group.keys.map((key) => {
                                                            const valueDisplay =
                                                                formatIntegrationKeyDisplay(key);

                                                            return (
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
                                                                        {valueDisplay
                                                                            ? ` · ${valueDisplay}`
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
                                                            );
                                                        })}
                                                    </ul>
                                                </section>
                                            );
                                        })}
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
                initialAccount={initialAccount}
            />

            <SmtpAccountFormModal
                isOpen={smtpFormOpen}
                onOpenChange={setSmtpFormOpen}
                providerView={providerView}
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
