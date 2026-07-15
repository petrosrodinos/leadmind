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
import { createSmtpAccount } from "@/features/integrations/services/integrations.service";
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

interface SmtpAccountFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    providerView: IntegrationProviderView;
}

export function SmtpAccountFormModal({
    isOpen,
    onOpenChange,
    providerView,
}: SmtpAccountFormModalProps) {
    const qc = useQueryClient();
    const [pending, setPending] = useState(false);
    const defaultAccount = useMemo(
        () => suggestNextAccountLabel(providerView.keys),
        [providerView.keys],
    );

    const [account, setAccount] = useState(defaultAccount);
    const [host, setHost] = useState("");
    const [port, setPort] = useState("587");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setAccount(defaultAccount);
        setHost("");
        setPort("587");
        setUsername("");
        setPassword("");
        setFromEmail("");
        setFormError(null);
    }, [defaultAccount, isOpen]);

    const handleSubmit = async () => {
        const trimmedAccount = account.trim();
        const fields = {
            HOST: host.trim(),
            PORT: port.trim(),
            USERNAME: username.trim(),
            PASSWORD: password.trim(),
            FROM_EMAIL: fromEmail.trim(),
        };

        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedAccount)) {
            setFormError("Account label may only use letters, numbers, underscores, or hyphens.");
            return;
        }

        if (Object.values(fields).some((value) => !value)) {
            setFormError("All SMTP fields are required.");
            return;
        }

        setPending(true);
        setFormError(null);

        try {
            await createSmtpAccount({
                account: trimmedAccount,
                host: fields.HOST,
                port: Number.parseInt(fields.PORT, 10),
                username: fields.USERNAME,
                password: fields.PASSWORD,
                from_email: fields.FROM_EMAIL,
            });
            await qc.invalidateQueries({ queryKey: integrationsQueryKeys.all });
            toast({ title: "SMTP account saved", duration: 1500 });
            onOpenChange(false);
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Could not save SMTP account.");
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
                            <Modal.Heading>Add SMTP account</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="smtp-account-label">Account label</Label>
                                <Input
                                    id="smtp-account-label"
                                    className={borderedFieldClass}
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                    placeholder="1, production, sales"
                                />
                                <p className="text-xs text-muted">
                                    Use one label for all SMTP credentials in this account.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <Label htmlFor="smtp-host">Host</Label>
                                    <Input
                                        id="smtp-host"
                                        className={borderedFieldClass}
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="smtp-port">Port</Label>
                                    <Input
                                        id="smtp-port"
                                        className={borderedFieldClass}
                                        value={port}
                                        onChange={(e) => setPort(e.target.value)}
                                        placeholder="587"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="smtp-from">From email</Label>
                                    <Input
                                        id="smtp-from"
                                        className={borderedFieldClass}
                                        value={fromEmail}
                                        onChange={(e) => setFromEmail(e.target.value)}
                                        placeholder="noreply@example.com"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <Label htmlFor="smtp-username">Username</Label>
                                    <Input
                                        id="smtp-username"
                                        className={borderedFieldClass}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <Label htmlFor="smtp-password">Password</Label>
                                    <Input
                                        id="smtp-password"
                                        className={borderedFieldClass}
                                        type="password"
                                        autoComplete="off"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="App password"
                                    />
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
                                Save SMTP account
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
