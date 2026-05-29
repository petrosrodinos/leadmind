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
    useCreateIntegrationCredential,
    useUpdateIntegrationCredential,
} from "@/features/integrations/hooks/use-integrations";
import type {
    IntegrationCredential,
    IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interface";
import {
    getCredentialKindDefinition,
    getIntegrationProviderDefinition,
} from "@/features/integrations/constants/integrations.catalog";

interface IntegrationCredentialFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    provider: IntegrationProvider;
    credential?: IntegrationCredential | null;
}

function buildEnvPreview(
    provider: IntegrationProvider,
    kind: string,
    account: string,
) {
    const providerPart = provider;
    const kindPart = kind.toUpperCase();
    const accountPart =
        account.trim() === "" || account.trim() === "default"
            ? ""
            : `_${account.trim().toUpperCase()}`;
    return `${providerPart}_${kindPart}${accountPart}`;
}

export function IntegrationCredentialFormModal({
    isOpen,
    onOpenChange,
    provider,
    credential,
}: IntegrationCredentialFormModalProps) {
    const definition = getIntegrationProviderDefinition(provider);
    const createCredential = useCreateIntegrationCredential();
    const updateCredential = useUpdateIntegrationCredential();
    const isEdit = !!credential;

    const defaultKind = definition.credentialKinds[0]?.kind ?? "api_key";

    const [kind, setKind] = useState(defaultKind);
    const [account, setAccount] = useState("default");
    const [secret, setSecret] = useState("");
    const [kindError, setKindError] = useState<string | null>(null);
    const [accountError, setAccountError] = useState<string | null>(null);
    const [secretError, setSecretError] = useState<string | null>(null);

    const kindMeta = useMemo(
        () => getCredentialKindDefinition(provider, kind),
        [provider, kind],
    );

    useEffect(() => {
        if (!isOpen) return;
        setKind(credential?.kind ?? defaultKind);
        setAccount(credential?.account ?? "default");
        setSecret("");
        setKindError(null);
        setAccountError(null);
        setSecretError(null);
    }, [isOpen, credential, defaultKind]);

    const pending = createCredential.isPending || updateCredential.isPending;
    const envPreview = buildEnvPreview(provider, kind, account);

    const handleSubmit = async () => {
        const trimmedAccount = account.trim() || "default";
        const trimmedKind = kind.trim();
        const trimmedSecret = secret.trim();
        let valid = true;

        if (!trimmedKind) {
            setKindError("Credential type is required");
            valid = false;
        } else {
            setKindError(null);
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
            if (isEdit && credential) {
                await updateCredential.mutateAsync({
                    uuid: credential.uuid,
                    payload: { secret: trimmedSecret },
                });
            } else {
                await createCredential.mutateAsync({
                    provider,
                    kind: trimmedKind,
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
                                    ? `Update ${credential?.label ?? "credential"}`
                                    : `Add ${definition.label} credential`}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Select
                                    className="w-full"
                                    isDisabled={isEdit}
                                    value={kind}
                                    onChange={(value) =>
                                        setKind(String(value ?? defaultKind))
                                    }
                                >
                                    <Label>Credential type</Label>
                                    <Select.Trigger>
                                        <Select.Value />
                                        <Select.Indicator />
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {definition.credentialKinds.map((row) => (
                                                <ListBox.Item
                                                    key={row.kind}
                                                    id={row.kind}
                                                    textValue={row.label}
                                                >
                                                    {row.label}
                                                    <ListBox.ItemIndicator />
                                                </ListBox.Item>
                                            ))}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                                {kindError && <FieldError>{kindError}</FieldError>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="integration-credential-account">
                                    Account
                                </Label>
                                <Input
                                    id="integration-credential-account"
                                    disabled={isEdit}
                                    placeholder="default, 1, production"
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                />
                                <p className="text-xs text-muted">
                                    Use the same account for credentials that belong
                                    together, e.g. Resend API key and webhook secret both
                                    on account <span className="font-mono">1</span>.
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
                                <Label htmlFor="integration-credential-secret">
                                    {kindMeta?.label ?? "Secret"}
                                </Label>
                                <Input
                                    id="integration-credential-secret"
                                    type="password"
                                    autoComplete="off"
                                    placeholder={kindMeta?.placeholder}
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
                                {isEdit ? "Save secret" : "Save credential"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
