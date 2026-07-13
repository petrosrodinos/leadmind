import { useEffect, useMemo } from "react";
import { Chip, Header, Label, ListBox, Select } from "@heroui/react";
import { Link } from "react-router-dom";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type { EmailProviderTarget } from "@/features/integrations/interfaces/integrations.interface";
import {
    allocationKey,
    groupSendableEmailAccounts,
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
    const groupedAccounts = useMemo(
        () => groupSendableEmailAccounts(integrations),
        [integrations],
    );
    const sendableAccounts = useMemo(
        () => groupedAccounts.flatMap((group) => group.accounts),
        [groupedAccounts],
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

    const selectedAccount = sendableAccounts.find(
        (row) => allocationKey(row) === selectedKey,
    );

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
                    <Select.Value>
                        {selectedAccount ? (
                            <span className="flex items-center gap-2 min-w-0">
                                <span className="truncate">{selectedAccount.label}</span>
                                {selectedAccount.isDefault ? (
                                    <Chip size="sm" variant="soft" color="warning">
                                        <Chip.Label>Default</Chip.Label>
                                    </Chip>
                                ) : null}
                            </span>
                        ) : null}
                    </Select.Value>
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {groupedAccounts.map((group) => (
                            <ListBox.Section key={group.provider}>
                                <Header className="text-xs font-medium uppercase tracking-wide text-muted">
                                    {group.label}
                                </Header>
                                {group.accounts.map((account) => {
                                    const key = allocationKey(account);
                                    return (
                                        <ListBox.Item
                                            key={key}
                                            id={key}
                                            textValue={account.label}
                                        >
                                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                <span className="truncate text-sm">
                                                    Account {account.account}
                                                </span>
                                                {account.detail ? (
                                                    <span className="truncate font-mono text-xs text-muted">
                                                        {account.detail}
                                                    </span>
                                                ) : null}
                                            </div>
                                            {account.isDefault ? (
                                                <Chip size="sm" variant="soft" color="warning">
                                                    <Chip.Label>Default</Chip.Label>
                                                </Chip>
                                            ) : null}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    );
                                })}
                            </ListBox.Section>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
            <p className="text-xs text-muted">
                {sendableAccounts.length} sendable account
                {sendableAccounts.length === 1 ? "" : "s"} across Resend and SMTP.
                SMTP sends won&apos;t receive delivery or open webhooks.
            </p>
        </div>
    );
}
