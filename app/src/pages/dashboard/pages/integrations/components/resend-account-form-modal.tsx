import { useEffect, useMemo, useState } from "react";
import {
    Button,
    FieldError,
    Input,
    Label,
    Modal,
} from "@heroui/react";
import { Save } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { createIntegrationKey } from "@/features/integrations/services/integrations.service";
import { suggestNextAccountLabel } from "@/features/integrations/constants/integration-key-types";
import type { IntegrationProviderView } from "@/features/integrations/interfaces/integrations.interface";
import { useQueryClient } from "@tanstack/react-query";
import { integrationsQueryKeys } from "@/features/integrations/hooks/use-integrations";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const borderedFieldClass = cn(
    "rounded-md border border-border bg-surface-primary",
    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
);

interface ResendAccountFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    providerView: IntegrationProviderView;
}

export function ResendAccountFormModal({
    isOpen,
    onOpenChange,
    providerView,
}: ResendAccountFormModalProps) {
    const qc = useQueryClient();
    const [pending, setPending] = useState(false);
    const defaultAccount = useMemo(
        () => suggestNextAccountLabel(providerView.keys),
        [providerView.keys],
    );

    const [account, setAccount] = useState(defaultAccount);
    const [apiKey, setApiKey] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setAccount(defaultAccount);
        setApiKey("");
        setFromEmail("");
        setFormError(null);
    }, [defaultAccount, isOpen]);

    const handleSubmit = async () => {
        const trimmedAccount = account.trim();
        const fields = {
            API_KEY: apiKey.trim(),
            FROM_EMAIL: fromEmail.trim(),
        };

        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAccount)) {
            setFormError("Account label may only use letters, numbers, underscores, or hyphens.");
            return;
        }

        if (Object.values(fields).some((value) => !value)) {
            setFormError("API key and from email are required.");
            return;
        }

        setPending(true);
        setFormError(null);

        try {
            const entries = Object.entries(fields) as Array<
                ["API_KEY" | "FROM_EMAIL", string]
            >;
            for (const [key_type, secret] of entries) {
                await createIntegrationKey("RESEND", {
                    key_type,
                    account: trimmedAccount,
                    secret,
                });
            }
            await qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "Resend account saved", duration: 1500 });
            onOpenChange(false);
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Could not save Resend account.");
        } finally {
            setPending(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Add Resend account</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="resend-account-label">Account label</Label>
                                <Input
                                    id="resend-account-label"
                                    className={borderedFieldClass}
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                    placeholder="1, production, sales"
                                />
                                <p className="text-xs text-muted">
                                    Use one label for all Resend credentials in this account.
                                </p>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="resend-api-key">API key</Label>
                                    <Input
                                        id="resend-api-key"
                                        className={borderedFieldClass}
                                        type="password"
                                        autoComplete="off"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="re_..."
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="resend-from">From address</Label>
                                    <Input
                                        id="resend-from"
                                        className={borderedFieldClass}
                                        value={fromEmail}
                                        onChange={(e) => setFromEmail(e.target.value)}
                                        placeholder="noreply@yourdomain.com"
                                    />
                                    <p className="text-xs text-muted">
                                        Must be a verified domain or address in your Resend account.
                                    </p>
                                </div>
                            </div>

                            {formError ? <FieldError>{formError}</FieldError> : null}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onPress={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <ActionButtonWithPending isPending={pending} onPress={handleSubmit}>
                                <Save className="size-4" />
                                Save Resend account
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
