import { PROVIDER_KEY_TYPES } from "@/features/integrations/constants/integration-key-types";
import type {
    EmailProviderAllocation,
    EmailProviderTarget,
    IntegrationKey,
    IntegrationProviderView,
} from "@/features/integrations/interfaces/integrations.interface";

export interface SendableEmailAccount extends EmailProviderTarget {
    label: string;
    last4: string | null;
}

const EMAIL_PROVIDERS = ["RESEND", "SMTP"] as const;

function distinctAccounts(keys: IntegrationKey[]): string[] {
    return [...new Set(keys.map((k) => k.account))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
    );
}

function accountHasRequiredKeys(
    provider: EmailProviderTarget["provider"],
    keys: IntegrationKey[],
    account: string,
): boolean {
    const accountKeys = keys.filter((k) => k.account === account);
    const required = PROVIDER_KEY_TYPES[provider];
    if (provider === "RESEND") {
        return accountKeys.some((k) => k.key_type === "API_KEY");
    }
    return required.every((keyType) =>
        accountKeys.some((k) => k.key_type === keyType),
    );
}

function accountLast4(keys: IntegrationKey[], account: string): string | null {
    const apiKey = keys.find(
        (k) => k.account === account && k.key_type === "API_KEY",
    );
    if (apiKey?.last4) return apiKey.last4;
    const fromEmail = keys.find(
        (k) => k.account === account && k.key_type === "FROM_EMAIL",
    );
    return fromEmail?.last4 ?? null;
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
            if (!accountHasRequiredKeys(provider, integration.keys, account)) {
                continue;
            }
            accounts.push({
                provider,
                account,
                label: `${integration.label} · Account ${account}`,
                last4: accountLast4(integration.keys, account),
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
        if (!accountHasRequiredKeys(provider, integration.keys, account)) {
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
