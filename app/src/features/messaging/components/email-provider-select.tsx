import { useEffect, useMemo, useRef } from "react";
import { Checkbox, Chip, Header, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import { Link } from "react-router-dom";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type {
    EmailProviderAllocation,
    EmailProviderTarget,
} from "@/features/integrations/interfaces/integrations.interface";
import {
    allocationKey,
    buildEqualAllocations,
    groupSendableEmailAccounts,
    resolveDefaultEmailTarget,
    validateAllocations,
} from "@/features/integrations/utils/email-provider-utils";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";

type EmailProviderSelectBaseProps = {
    disabled?: boolean;
};

export type EmailProviderSelectProps = EmailProviderSelectBaseProps &
    (
        | {
              totalCount?: undefined;
              value: EmailProviderTarget | null;
              onChange: (target: EmailProviderTarget) => void;
          }
        | {
              totalCount: number;
              value: EmailProviderAllocation[];
              onChange: (allocations: EmailProviderAllocation[]) => void;
          }
    );

export function isEmailProviderAllocationValid(
    allocations: EmailProviderAllocation[],
    totalCount: number,
): boolean {
    return validateAllocations(allocations, totalCount) === null;
}

function EmailProviderSingleSelect({
    value,
    onChange,
    disabled,
    groupedAccounts,
    sendableAccounts,
    integrations,
}: {
    value: EmailProviderTarget | null;
    onChange: (target: EmailProviderTarget) => void;
    disabled: boolean;
    groupedAccounts: ReturnType<typeof groupSendableEmailAccounts>;
    sendableAccounts: ReturnType<typeof groupSendableEmailAccounts>[number]["accounts"];
    integrations: ReturnType<typeof useIntegrations>["data"];
}) {
    const selectedKey = value ? allocationKey(value) : null;

    useEffect(() => {
        if (sendableAccounts.length === 0) return;
        if (value && sendableAccounts.some((row) => allocationKey(row) === selectedKey)) {
            return;
        }
        const defaultTarget = resolveDefaultEmailTarget(integrations);
        if (defaultTarget) {
            onChange(defaultTarget);
        }
    }, [integrations, onChange, selectedKey, sendableAccounts, value]);

    const selectedAccount = sendableAccounts.find((row) => allocationKey(row) === selectedKey);

    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Send from</Label>
            <Select
                aria-label="Email provider account"
                selectedKey={selectedKey}
                onSelectionChange={(key) => {
                    const match = sendableAccounts.find((row) => allocationKey(row) === key);
                    if (match) {
                        onChange({ provider: match.provider, account: match.account });
                    }
                }}
                isDisabled={disabled}
                fullWidth
            >
                <Select.Trigger
                    className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-surface-primary",
                        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
                    )}
                >
                    <Select.Value className="min-w-0 flex-1 overflow-hidden">
                        {selectedAccount ? (
                            <span className="flex min-w-0 items-center gap-2">
                                <span className="truncate">
                                    {selectedAccount.detail?.startsWith("from ")
                                        ? selectedAccount.detail.slice(5)
                                        : selectedAccount.label}
                                </span>
                                {selectedAccount.isDefault ? (
                                    <Chip size="sm" variant="soft" color="warning" className="shrink-0">
                                        <Chip.Label>Default</Chip.Label>
                                    </Chip>
                                ) : null}
                            </span>
                        ) : null}
                    </Select.Value>
                    <Select.Indicator className="shrink-0" />
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
                                            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                                        >
                                            <div className="min-w-0 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-sm">
                                                        {account.detail?.startsWith("from ")
                                                            ? account.detail.slice(5)
                                                            : `Account ${account.account}`}
                                                    </span>
                                                    {account.isDefault ? (
                                                        <Chip
                                                            size="sm"
                                                            variant="soft"
                                                            color="warning"
                                                            className="shrink-0"
                                                        >
                                                            <Chip.Label>Default</Chip.Label>
                                                        </Chip>
                                                    ) : null}
                                                </div>
                                                <span className="truncate font-mono text-xs text-muted">
                                                    {account.detail?.startsWith("from ")
                                                        ? `Account ${account.account}`
                                                        : account.detail ?? null}
                                                </span>
                                            </div>
                                            <ListBox.ItemIndicator className="shrink-0" />
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

function EmailProviderAllocationSelect({
    totalCount,
    value,
    onChange,
    disabled,
    groupedAccounts,
    sendableAccounts,
}: {
    totalCount: number;
    value: EmailProviderAllocation[];
    onChange: (allocations: EmailProviderAllocation[]) => void;
    disabled: boolean;
    groupedAccounts: ReturnType<typeof groupSendableEmailAccounts>;
    sendableAccounts: ReturnType<typeof groupSendableEmailAccounts>[number]["accounts"];
}) {
    const selectedKeys = useMemo(
        () => new Set(value.map((row) => allocationKey(row))),
        [value],
    );

    const initializedRef = useRef(false);

    useEffect(() => {
        if (sendableAccounts.length === 0) return;

        if (!initializedRef.current && value.length === 0) {
            initializedRef.current = true;
            onChange(buildEqualAllocations(sendableAccounts, totalCount));
            return;
        }

        initializedRef.current = true;
    }, [onChange, sendableAccounts, totalCount, value.length]);

    useEffect(() => {
        if (sendableAccounts.length === 0 || value.length === 0) return;
        const validKeys = new Set(sendableAccounts.map(allocationKey));
        const filtered = value.filter((row) => validKeys.has(allocationKey(row)));
        if (filtered.length !== value.length) {
            onChange(
                filtered.length > 0
                    ? buildEqualAllocations(filtered, totalCount)
                    : buildEqualAllocations(sendableAccounts, totalCount),
            );
        }
    }, [onChange, sendableAccounts, totalCount, value]);

    const previousTotalCountRef = useRef(totalCount);
    useEffect(() => {
        if (previousTotalCountRef.current === totalCount || value.length === 0) {
            previousTotalCountRef.current = totalCount;
            return;
        }
        previousTotalCountRef.current = totalCount;
        onChange(buildEqualAllocations(value, totalCount));
    }, [onChange, totalCount, value]);

    const validationError = validateAllocations(value, totalCount);
    const allocated = value.reduce((sum, row) => sum + row.count, 0);

    const resendAccounts =
        groupedAccounts.find((group) => group.provider === "RESEND")?.accounts ?? [];
    const smtpAccounts =
        groupedAccounts.find((group) => group.provider === "SMTP")?.accounts ?? [];

    const toggleAccount = (account: (typeof sendableAccounts)[number], checked: boolean) => {
        const key = allocationKey(account);
        let nextTargets: EmailProviderAllocation[] = value.filter((row) =>
            selectedKeys.has(allocationKey(row)),
        );

        if (checked) {
            if (!nextTargets.some((row) => allocationKey(row) === key)) {
                nextTargets = [
                    ...nextTargets,
                    { provider: account.provider, account: account.account, count: 0 },
                ];
            }
        } else {
            nextTargets = nextTargets.filter((row) => allocationKey(row) !== key);
        }

        onChange(buildEqualAllocations(nextTargets, totalCount));
    };

    const updateCount = (accountKey: string, count: number) => {
        onChange(
            value.map((row) =>
                allocationKey(row) === accountKey
                    ? { ...row, count: Number.isFinite(count) ? Math.max(0, count) : 0 }
                    : row,
            ),
        );
    };

    const renderGroup = (title: string, accounts: typeof sendableAccounts) => {
        if (accounts.length === 0) return null;
        return (
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
                <div className="space-y-2">
                    {accounts.map((account) => {
                        const key = allocationKey(account);
                        const selected = selectedKeys.has(key);
                        const allocation = value.find((row) => allocationKey(row) === key);

                        return (
                            <div
                                key={key}
                                className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2"
                            >
                                <Checkbox
                                    isSelected={selected}
                                    onChange={(checked) => toggleAccount(account, checked)}
                                    isDisabled={disabled}
                                >
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    <span className="text-sm text-foreground">
                                        {account.label}
                                        {account.last4 ? (
                                            <span className="ml-1 font-mono text-xs text-muted">
                                                {account.last4}
                                            </span>
                                        ) : null}
                                    </span>
                                </Checkbox>
                                {selected ? (
                                    <TextField
                                        aria-label={`Allocation for ${account.label}`}
                                        className="ml-auto w-24"
                                    >
                                        <Label className="sr-only">Count</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={String(allocation?.count ?? 0)}
                                            onChange={(e) =>
                                                updateCount(key, parseInt(e.target.value, 10))
                                            }
                                            disabled={disabled}
                                        />
                                    </TextField>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-medium text-foreground">Email providers</p>
                <p className="mt-1 text-xs text-muted">
                    Choose which accounts send this batch. Counts split across selected accounts
                    (SMTP delivery status stays at sent — no open tracking).
                </p>
            </div>

            {renderGroup("Resend", resendAccounts)}
            {renderGroup("SMTP", smtpAccounts)}

            <p className={`text-xs ${validationError ? "text-danger" : "text-muted"}`}>
                {validationError ??
                    `Allocated ${allocated} of ${totalCount} email${totalCount === 1 ? "" : "s"}.`}
            </p>
        </div>
    );
}

export function EmailProviderSelect(props: EmailProviderSelectProps) {
    const { disabled = false } = props;
    const { data: integrations, isLoading } = useIntegrations();
    const groupedAccounts = useMemo(
        () => groupSendableEmailAccounts(integrations),
        [integrations],
    );
    const sendableAccounts = useMemo(
        () => groupedAccounts.flatMap((group) => group.accounts),
        [groupedAccounts],
    );

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

    if (props.totalCount !== undefined) {
        return (
            <EmailProviderAllocationSelect
                totalCount={props.totalCount}
                value={props.value}
                onChange={props.onChange}
                disabled={disabled}
                groupedAccounts={groupedAccounts}
                sendableAccounts={sendableAccounts}
            />
        );
    }

    return (
        <EmailProviderSingleSelect
            value={props.value}
            onChange={props.onChange}
            disabled={disabled}
            groupedAccounts={groupedAccounts}
            sendableAccounts={sendableAccounts}
            integrations={integrations}
        />
    );
}
