import { useEffect, useMemo } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import { Link } from "react-router-dom";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type { EmailProviderTarget } from "@/features/integrations/interfaces/integrations.interface";
import {
    allocationKey,
    listSendableEmailAccounts,
    resolveDefaultEmailTarget,
} from "@/features/integrations/utils/email-provider-utils";
import { Routes } from "@/routes/routes";

export interface EmailProviderSelectProps {
    value: EmailProviderTarget | null;
    onChange: (target: EmailProviderTarget) => void;
    disabled?: boolean;
}

export function EmailProviderSelect({
    value,
    onChange,
    disabled = false,
}: EmailProviderSelectProps) {
    const { data: integrations, isLoading } = useIntegrations();
    const sendableAccounts = useMemo(
        () => listSendableEmailAccounts(integrations),
        [integrations],
    );

    const selectedKey = value ? allocationKey(value) : null;

    useEffect(() => {
        if (isLoading || sendableAccounts.length === 0) return;
        if (value && sendableAccounts.some((row) => allocationKey(row) === selectedKey)) {
            return;
        }
        const defaultTarget = resolveDefaultEmailTarget(integrations);
        if (defaultTarget) {
            onChange(defaultTarget);
        }
    }, [integrations, isLoading, onChange, selectedKey, sendableAccounts, value]);

    if (isLoading) {
        return <p className="text-sm text-muted">Loading email providers…</p>;
    }

    if (sendableAccounts.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-surface-secondary/40 px-4 py-3 text-sm text-muted">
                No sendable Resend or SMTP accounts found.{" "}
                <Link
                    to={Routes.dashboard.integrations}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                    Configure integrations
                </Link>
                .
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Send from</Label>
            <Select
                aria-label="Email provider account"
                selectedKey={selectedKey}
                onSelectionChange={(key) => {
                    const match = sendableAccounts.find(
                        (row) => allocationKey(row) === key,
                    );
                    if (match) {
                        onChange({ provider: match.provider, account: match.account });
                    }
                }}
                isDisabled={disabled}
            >
                <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {sendableAccounts.map((account) => {
                            const key = allocationKey(account);
                            const hint = account.last4 ? ` ····${account.last4}` : "";
                            return (
                                <ListBox.Item
                                    key={key}
                                    id={key}
                                    textValue={`${account.label}${hint}`}
                                >
                                    {account.label}
                                    {hint ? (
                                        <span className="font-mono text-xs text-muted">
                                            {hint}
                                        </span>
                                    ) : null}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            );
                        })}
                    </ListBox>
                </Select.Popover>
            </Select>
            <p className="text-xs text-muted">
                SMTP sends won&apos;t receive delivery or open webhooks.
            </p>
        </div>
    );
}
