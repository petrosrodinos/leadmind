import type {
    IntegrationKey,
    IntegrationKeyType,
    IntegrationProvider,
} from "../interfaces/integrations.interface";

export const PROVIDER_KEY_TYPES: Record<IntegrationProvider, IntegrationKeyType[]> =
    {
        OPENAI: ["API_KEY"],
        ANTHROPIC: ["API_KEY"],
        RESEND: ["API_KEY", "WEBHOOK_SECRET"],
        TWILIO: ["ACCOUNT_SID", "AUTH_TOKEN"],
        APIFY: ["API_KEY"],
        HUBSPOT: ["ACCESS_TOKEN"],
    };

export const KEY_TYPE_LABELS: Record<IntegrationKeyType, string> = {
    API_KEY: "API key",
    WEBHOOK_SECRET: "Webhook secret",
    ACCOUNT_SID: "Account SID",
    AUTH_TOKEN: "Auth token",
    ACCESS_TOKEN: "Access token",
};

export const KEY_TYPE_PLACEHOLDERS: Record<IntegrationKeyType, string> = {
    API_KEY: "sk-... / re_...",
    WEBHOOK_SECRET: "whsec_...",
    ACCOUNT_SID: "AC...",
    AUTH_TOKEN: "Auth token",
    ACCESS_TOKEN: "pat-...",
};

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
