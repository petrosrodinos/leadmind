import { useEffect, useMemo, useState } from "react";
import {
    Button,
    FieldError,
    Input,
    Label,
    ListBox,
    Modal,
    Select,
} from "@heroui/react";
import { Save } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCreateIntegrationKey,
    useUpdateIntegrationKey,
} from "@/features/integrations/hooks/use-integrations";
import {
    formatIntegrationKeyEnvName,
    KEY_TYPE_PLACEHOLDERS,
} from "@/features/integrations/constants/integration-key-types";
import type {
    IntegrationKey,
    IntegrationKeyType,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";

interface IntegrationKeyFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    providerView: IntegrationProviderView;
    keyItem?: IntegrationKey | null;
    initialKeyType?: IntegrationKeyType;
}

export function IntegrationKeyFormModal({
    isOpen,
    onOpenChange,
    providerView,
    keyItem,
    initialKeyType,
}: IntegrationKeyFormModalProps) {
    const createKey = useCreateIntegrationKey(providerView.provider);
    const updateKey = useUpdateIntegrationKey();
    const isEdit = !!keyItem;

    const defaultKeyType =
        initialKeyType ??
        keyItem?.key_type ??
        providerView.keyTypes[0]?.key_type ??
        "API_KEY";

    const [keyType, setKeyType] = useState<IntegrationKeyType>(defaultKeyType);
    const [account, setAccount] = useState("1");
    const [secret, setSecret] = useState("");
    const [keyTypeError, setKeyTypeError] = useState<string | null>(null);
    const [accountError, setAccountError] = useState<string | null>(null);
    const [secretError, setSecretError] = useState<string | null>(null);

    const keyTypeMeta = useMemo(
        () => providerView.keyTypes.find((row) => row.key_type === keyType),
        [providerView.keyTypes, keyType],
    );

    useEffect(() => {
        if (!isOpen) return;
        setKeyType(keyItem?.key_type ?? initialKeyType ?? defaultKeyType);
        setAccount(keyItem?.account ?? "1");
        setSecret("");
        setKeyTypeError(null);
        setAccountError(null);
        setSecretError(null);
    }, [isOpen, keyItem, initialKeyType, defaultKeyType]);

    const pending = createKey.isPending || updateKey.isPending;
    const envPreview = formatIntegrationKeyEnvName(
        providerView.provider,
        keyType,
        account,
    );

    const handleSubmit = async () => {
        const trimmedAccount = account.trim();
        const trimmedSecret = secret.trim();
        let valid = true;

        if (!keyType) {
            setKeyTypeError("Credential type is required");
            valid = false;
        } else {
            setKeyTypeError(null);
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAccount)) {
            setAccountError("Use letters, numbers, underscores, or hyphens");
            valid = false;
        } else {
            setAccountError(null);
        }

        if (!trimmedSecret) {
            setSecretError("Secret is required");
            valid = false;
        } else {
            setSecretError(null);
        }

        if (!valid) return;

        try {
            if (isEdit && keyItem) {
                await updateKey.mutateAsync({
                    uuid: keyItem.uuid,
                    payload: { secret: trimmedSecret },
                });
            } else {
                await createKey.mutateAsync({
                    key_type: keyType,
                    account: trimmedAccount,
                    secret: trimmedSecret,
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
                                {isEdit
                                    ? `Update ${keyItem?.env_name ?? "key"}`
                                    : `Add ${providerView.label} key`}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Select
                                    className="w-full"
                                    isDisabled={isEdit}
                                    value={keyType}
                                    onChange={(value) =>
                                        setKeyType(
                                            String(value ?? defaultKeyType) as IntegrationKeyType,
                                        )
                                    }
                                >
                                    <Label>Credential type</Label>
                                    <Select.Trigger>
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {providerView.keyTypes.map((row) => (
                                                <ListBox.Item
                                                    key={row.key_type}
                                                    id={row.key_type}
                                                    textValue={row.label}
                                                >
                                                    {row.label}
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            ))}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                                {keyTypeError && (
                                    <FieldError>{keyTypeError}</FieldError>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="integration-key-account">
                                    Account
                                </Label>
                                <Input
                                    id="integration-key-account"
                                    disabled={isEdit}
                                    placeholder="1, production, main"
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                />
                                <p className="text-xs text-muted">
                                    Use the same account for keys that belong
                                    together. Example: account{" "}
                                    <span className="font-mono">1</span> gives{" "}
                                    <span className="font-mono">
                                        {providerView.provider}_API_KEY_1
                                    </span>{" "}
                                    and{" "}
                                    <span className="font-mono">
                                        {providerView.provider}_WEBHOOK_SECRET_1
                                    </span>
                                    .
                                </p>
                                {accountError && (
                                    <FieldError>{accountError}</FieldError>
                                )}
                            </div>

                            <div className="rounded-lg border border-border bg-surface-secondary/40 px-3 py-2">
                                <p className="text-xs text-muted">Reference name</p>
                                <p className="text-sm font-mono text-foreground mt-1">
                                    {envPreview}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="integration-key-secret">
                                    {keyTypeMeta?.label ?? "Secret"}
                                </Label>
                                <Input
                                    id="integration-key-secret"
                                    type="password"
                                    autoComplete="off"
                                    placeholder={
                                        keyTypeMeta?.placeholder ??
                                        KEY_TYPE_PLACEHOLDERS[keyType]
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
                                {isEdit ? "Save secret" : "Save key"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
