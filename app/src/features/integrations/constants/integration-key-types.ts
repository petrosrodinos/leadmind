import type {
    IntegrationKey,
    IntegrationKeyType,
    IntegrationProvider,
    IntegrationProviderView,
} from "../interfaces/integrations.interface";

export const PROVIDER_KEY_TYPES: Record<IntegrationProvider, IntegrationKeyType[]> =
    {
        OPENAI: ["API_KEY", "WEBHOOK_SECRET"],
        ANTHROPIC: ["API_KEY"],
        RESEND: ["API_KEY", "WEBHOOK_SECRET"],
        SMTP: ["HOST", "PORT", "USERNAME", "PASSWORD", "FROM_EMAIL"],
        TWILIO: ["ACCOUNT_SID", "AUTH_TOKEN"],
        APIFY: ["API_KEY"],
        HUBSPOT: ["ACCESS_TOKEN"],
    };

export const DISABLED_INTEGRATION_PROVIDERS: IntegrationProvider[] = [
    "TWILIO",
    "HUBSPOT",
];

export const KEY_TYPE_LABELS: Record<IntegrationKeyType, string> = {
    API_KEY: "API key",
    WEBHOOK_SECRET: "Webhook secret",
    ACCOUNT_SID: "Account SID",
    AUTH_TOKEN: "Auth token",
    ACCESS_TOKEN: "Access token",
    HOST: "Host",
    PORT: "Port",
    USERNAME: "Username",
    PASSWORD: "Password",
    FROM_EMAIL: "From email",
};

export const KEY_TYPE_PLACEHOLDERS: Record<IntegrationKeyType, string> = {
    API_KEY: "sk-... / re_...",
    WEBHOOK_SECRET: "whsec_...",
    ACCOUNT_SID: "AC...",
    AUTH_TOKEN: "Auth token",
    ACCESS_TOKEN: "pat-...",
    HOST: "smtp.example.com",
    PORT: "587",
    USERNAME: "user@example.com",
    PASSWORD: "App password",
    FROM_EMAIL: "noreply@example.com",
};

export const MASKED_INTEGRATION_KEY_TYPES = new Set<IntegrationKeyType>([
    "API_KEY",
    "WEBHOOK_SECRET",
    "AUTH_TOKEN",
    "ACCESS_TOKEN",
    "PASSWORD",
]);

export function formatIntegrationKeyEnvName(
    provider: IntegrationProvider,
    keyType: IntegrationKeyType,
    account: string,
): string {
    return `${provider}_${keyType}_${account.trim()}`;
}

export function groupKeysByAccount(keys: IntegrationKey[]) {
    const groups = new Map<string, IntegrationKey[]>();
    for (const key of keys) {
        const list = groups.get(key.account) ?? [];
        list.push(key);
        groups.set(key.account, list);
    }
    return [...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([account, items]) => ({
            account,
            keys: items.sort((left, right) =>
                left.key_type.localeCompare(right.key_type),
            ),
        }));
}

export const MULTI_ACCOUNT_INTEGRATION_PROVIDERS: IntegrationProvider[] = [
    "RESEND",
    "SMTP",
    "TWILIO",
];

export const DEFAULT_ACCOUNT_SELECTION_PROVIDERS: IntegrationProvider[] = [
    "RESEND",
    "SMTP",
];

export function providerAllowsMultipleAccounts(
    provider: IntegrationProvider,
): boolean {
    return MULTI_ACCOUNT_INTEGRATION_PROVIDERS.includes(provider);
}

export function providerSupportsDefaultAccountSelection(
    provider: IntegrationProvider,
): boolean {
    return DEFAULT_ACCOUNT_SELECTION_PROVIDERS.includes(provider);
}

export function canShowAddKeyButton(providerView: IntegrationProviderView): boolean {
    const allowsMultipleAccounts =
        providerView.allows_multiple_accounts ??
        providerAllowsMultipleAccounts(providerView.provider);

    if (allowsMultipleAccounts) {
        return true;
    }

    return providerView.keys.length === 0;
}
