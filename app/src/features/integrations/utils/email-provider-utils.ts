import {
    isEmailAccountSendable,
} from "@/features/integrations/constants/integration-key-types";
import type {
    EmailProviderAllocation,
    EmailProviderTarget,
    IntegrationKey,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";

export interface SendableEmailAccount extends EmailProviderTarget {
    label: string;
    detail: string | null;
    last4: string | null;
    isDefault: boolean;
}

const EMAIL_PROVIDERS = ["RESEND", "SMTP"] as const;

function distinctAccounts(keys: IntegrationKey[]): string[] {
    return [...new Set(keys.map((k) => k.account))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
    );
}

function keyValueHint(keys: IntegrationKey[], account: string, keyType: IntegrationKey["key_type"]): string | null {
    const key = keys.find((row) => row.account === account && row.key_type === keyType);
    if (!key) return null;
    if (key.display_value) return key.display_value;
    if (!key.last4) return null;
    return `····${key.last4}`;
}

function buildAccountDetail(
    provider: EmailProviderTarget["provider"],
    keys: IntegrationKey[],
    account: string,
): string | null {
    if (provider === "RESEND") {
        return keyValueHint(keys, account, "API_KEY");
    }

    const host = keys.find(
        (row) => row.account === account && row.key_type === "HOST",
    );
    const fromEmail = keys.find(
        (row) => row.account === account && row.key_type === "FROM_EMAIL",
    );
    const hostHint = host?.display_value ?? (host?.last4 ? `····${host.last4}` : null);
    const fromHint = fromEmail?.display_value ?? (fromEmail?.last4 ? fromEmail.last4 : null);

    if (hostHint && fromHint) {
        return `host ${hostHint} · from ${fromHint}`;
    }
    if (fromHint) {
        return `from ${fromHint}`;
    }
    if (hostHint) {
        return `host ${hostHint}`;
    }
    return null;
}

function buildAccountLabel(
    integrationLabel: string,
    account: string,
    detail: string | null,
): string {
    if (detail) {
        return `${integrationLabel} · Account ${account} (${detail})`;
    }
    return `${integrationLabel} · Account ${account}`;
}

export function listSendableEmailAccounts(
    integrations: IntegrationProviderView[] | undefined,
): SendableEmailAccount[] {
    if (!integrations?.length) return [];

    const accounts: SendableEmailAccount[] = [];

    for (const provider of EMAIL_PROVIDERS) {
        const integration = integrations.find((row) => row.provider === provider);
        if (!integration) continue;

        for (const account of distinctAccounts(integration.keys)) {
            if (!isEmailAccountSendable(provider, integration.keys, account)) {
                continue;
            }
            const detail = buildAccountDetail(provider, integration.keys, account);
            accounts.push({
                provider,
                account,
                label: buildAccountLabel(integration.label, account, detail),
                detail,
                last4: keyValueHint(
                    integration.keys,
                    account,
                    provider === "RESEND" ? "API_KEY" : "FROM_EMAIL",
                ),
                isDefault: integration.default_account === account,
            });
        }
    }

    return accounts.sort((left, right) =>
        `${left.provider}:${left.account}`.localeCompare(
            `${right.provider}:${right.account}`,
            undefined,
            { numeric: true },
        ),
    );
}

export function groupSendableEmailAccounts(
    integrations: IntegrationProviderView[] | undefined,
): { provider: EmailProviderTarget["provider"]; label: string; accounts: SendableEmailAccount[] }[] {
    const sendable = listSendableEmailAccounts(integrations);
    return EMAIL_PROVIDERS.map((provider) => ({
        provider,
        label: provider === "RESEND" ? "Resend" : "SMTP",
        accounts: sendable.filter((row) => row.provider === provider),
    })).filter((group) => group.accounts.length > 0);
}

export function buildEqualAllocations(
    accounts: EmailProviderTarget[],
    totalCount: number,
): EmailProviderAllocation[] {
    if (accounts.length === 0 || totalCount <= 0) return [];

    const base = Math.floor(totalCount / accounts.length);
    let remainder = totalCount % accounts.length;

    return accounts.map((account) => {
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder -= 1;
        return {
            ...account,
            count: base + extra,
        };
    });
}

export function validateAllocations(
    allocations: EmailProviderAllocation[],
    totalCount: number,
): string | null {
    if (allocations.length === 0) {
        return "Select at least one email provider account.";
    }
    if (allocations.some((row) => row.count < 0)) {
        return "Allocation counts cannot be negative.";
    }
    const sum = allocations.reduce((acc, row) => acc + row.count, 0);
    if (sum !== totalCount) {
        return `Allocated ${sum} of ${totalCount} emails. Adjust counts to match.`;
    }
    return null;
}

export function resolveDefaultEmailTarget(
    integrations: IntegrationProviderView[] | undefined,
): EmailProviderTarget | null {
    if (!integrations?.length) return null;

    for (const provider of EMAIL_PROVIDERS) {
        const integration = integrations.find((row) => row.provider === provider);
        if (!integration?.default_account) continue;
        const account = integration.default_account;
        if (!isEmailAccountSendable(provider, integration.keys, account)) {
            continue;
        }
        return { provider, account };
    }

    const sendable = listSendableEmailAccounts(integrations);
    return sendable[0] ?? null;
}

export function allocationKey(row: EmailProviderTarget): string {
    return `${row.provider}:${row.account}`;
}
