import { useEffect, useMemo, useRef } from "react";
import { Checkbox, Input, Label, TextField } from "@heroui/react";
import { Link } from "react-router-dom";
import { useIntegrations } from "@/features/integrations/hooks/use-integrations";
import type { EmailProviderAllocation } from "@/features/integrations/interfaces/integrations.interface";
import {
    allocationKey,
    buildEqualAllocations,
    groupSendableEmailAccounts,
    validateAllocations,
} from "@/features/integrations/utils/email-provider-utils";
import { Routes } from "@/routes/routes";

export interface EmailProviderAllocationPickerProps {
    totalCount: number;
    value: EmailProviderAllocation[];
    onChange: (allocations: EmailProviderAllocation[]) => void;
    disabled?: boolean;
}

export function EmailProviderAllocationPicker({
    totalCount,
    value,
    onChange,
    disabled = false,
}: EmailProviderAllocationPickerProps) {
    const { data: integrations, isLoading } = useIntegrations();
    const groupedAccounts = useMemo(
        () => groupSendableEmailAccounts(integrations),
        [integrations],
    );
    const sendableAccounts = useMemo(
        () => groupedAccounts.flatMap((group) => group.accounts),
        [groupedAccounts],
    );

    const selectedKeys = useMemo(
        () => new Set(value.map((row) => allocationKey(row))),
        [value],
    );

    const initializedRef = useRef(false);

    useEffect(() => {
        if (isLoading || sendableAccounts.length === 0) return;

        if (!initializedRef.current && value.length === 0) {
            initializedRef.current = true;
            onChange(buildEqualAllocations(sendableAccounts, totalCount));
            return;
        }

        initializedRef.current = true;
    }, [isLoading, onChange, sendableAccounts, totalCount, value.length]);

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

    if (isLoading) {
        return (
            <p className="text-sm text-muted">Loading email providers…</p>
        );
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
                </Link>{" "}
                to send email.
            </div>
        );
    }

    const renderGroup = (
        title: string,
        accounts: typeof sendableAccounts,
    ) => {
        if (accounts.length === 0) return null;
        return (
            <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {title}
                </p>
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
                    Choose which accounts send this batch. Counts split across selected
                    accounts (SMTP delivery status stays at sent — no open tracking).
                </p>
            </div>

            {renderGroup("Resend", resendAccounts)}
            {renderGroup("SMTP", smtpAccounts)}

            <p
                className={`text-xs ${validationError ? "text-danger" : "text-muted"}`}
            >
                {validationError ??
                    `Allocated ${allocated} of ${totalCount} email${totalCount === 1 ? "" : "s"}.`}
            </p>
        </div>
    );
}

export function isEmailProviderAllocationValid(
    allocations: EmailProviderAllocation[],
    totalCount: number,
): boolean {
    return validateAllocations(allocations, totalCount) === null;
}
