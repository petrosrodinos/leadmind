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
        RESEND: ["API_KEY", "FROM_EMAIL", "WEBHOOK_SECRET"],
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

const SMTP_DISPLAYABLE_KEY_TYPES = new Set<IntegrationKeyType>([
    "HOST",
    "PORT",
    "USERNAME",
    "FROM_EMAIL",
]);

const RESEND_DISPLAYABLE_KEY_TYPES = new Set<IntegrationKeyType>(["FROM_EMAIL"]);

export function shouldExposeIntegrationKeyDisplayValue(
    provider: IntegrationProvider,
    keyType: IntegrationKeyType,
): boolean {
    if (provider === "SMTP" && SMTP_DISPLAYABLE_KEY_TYPES.has(keyType)) {
        return true;
    }
    return provider === "RESEND" && RESEND_DISPLAYABLE_KEY_TYPES.has(keyType);
}

export function formatIntegrationKeyDisplay(
    key: Pick<IntegrationKey, "last4" | "display_value">,
): string | null {
    if (key.display_value) {
        return key.display_value;
    }
    if (key.last4) {
        return `•••• ${key.last4}`;
    }
    return null;
}

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

export function resolveEffectiveDefaultAccount(
    stored: string | null | undefined,
    keys: IntegrationKey[],
): string | null {
    const accounts = listDistinctIntegrationAccounts(keys);
    if (accounts.length === 0) {
        return null;
    }
    if (stored?.trim() && accounts.includes(stored.trim())) {
        return stored.trim();
    }
    return accounts[0];
}

export function suggestAccountForKeyType(
    provider: IntegrationProvider,
    keys: IntegrationKey[],
    keyType: IntegrationKeyType,
): string {
    if (provider === "RESEND" && keyType === "FROM_EMAIL") {
        const apiKeyAccounts = keys
            .filter((key) => key.key_type === "API_KEY")
            .map((key) => key.account);
        const missingFrom = apiKeyAccounts.find(
            (account) =>
                !keys.some(
                    (key) => key.account === account && key.key_type === "FROM_EMAIL",
                ),
        );
        if (missingFrom) {
            return missingFrom;
        }
    }
    return suggestNextAccountLabel(keys);
}

export function suggestNextAccountLabel(keys: IntegrationKey[]): string {
    const accounts = listDistinctIntegrationAccounts(keys);
    if (accounts.length === 0) {
        return "1";
    }

    const numericAccounts = accounts
        .map((account) => Number.parseInt(account, 10))
        .filter((value) => !Number.isNaN(value));

    if (numericAccounts.length === accounts.length) {
        return String(Math.max(...numericAccounts) + 1);
    }

    let candidate = 1;
    while (accounts.includes(String(candidate))) {
        candidate += 1;
    }
    return String(candidate);
}

export function getMissingKeyTypesForAccount(
    provider: IntegrationProvider,
    keys: IntegrationKey[],
    account: string,
): IntegrationKeyType[] {
    const accountKeys = keys.filter((key) => key.account === account);
    const used = new Set(accountKeys.map((key) => key.key_type));
    return PROVIDER_KEY_TYPES[provider].filter((keyType) => !used.has(keyType));
}

export function isEmailProviderAccountVisible(
    provider: Extract<IntegrationProvider, "RESEND" | "SMTP">,
    keys: IntegrationKey[],
    account: string,
): boolean {
    const accountKeys = keys.filter((key) => key.account === account);
    if (provider === "RESEND") {
        return accountKeys.some((key) => key.key_type === "API_KEY");
    }
    return PROVIDER_KEY_TYPES.SMTP.every((keyType) =>
        accountKeys.some((key) => key.key_type === keyType),
    );
}

export function isEmailAccountSendable(
    provider: Extract<IntegrationProvider, "RESEND" | "SMTP">,
    keys: IntegrationKey[],
    account: string,
): boolean {
    const accountKeys = keys.filter((key) => key.account === account);
    if (provider === "RESEND") {
        const required: IntegrationKeyType[] = ["API_KEY", "FROM_EMAIL"];
        return required.every((keyType) =>
            accountKeys.some((key) => key.key_type === keyType),
        );
    }
    return PROVIDER_KEY_TYPES.SMTP.every((keyType) =>
        accountKeys.some((key) => key.key_type === keyType),
    );
}

export function countSendableEmailAccounts(
    providerView: IntegrationProviderView,
): number {
    if (providerView.provider !== "RESEND" && providerView.provider !== "SMTP") {
        return 0;
    }
    return listDistinctIntegrationAccounts(providerView.keys).filter((account) =>
        isEmailAccountSendable(providerView.provider as "RESEND" | "SMTP", providerView.keys, account),
    ).length;
}

function listDistinctIntegrationAccounts(keys: IntegrationKey[]): string[] {
    return [...new Set(keys.map((key) => key.account))].sort((left, right) =>
        left.localeCompare(right, undefined, { numeric: true }),
    );
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
