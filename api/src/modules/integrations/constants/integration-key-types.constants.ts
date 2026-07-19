import {
    ExternalIntegrationProvider,
    IntegrationKeyType,
} from '@/generated/prisma';

export const PROVIDER_KEY_TYPES: Record<
    ExternalIntegrationProvider,
    IntegrationKeyType[]
> = {
    [ExternalIntegrationProvider.OPENAI]: [
        IntegrationKeyType.API_KEY,
        IntegrationKeyType.WEBHOOK_SECRET,
    ],
    [ExternalIntegrationProvider.ANTHROPIC]: [IntegrationKeyType.API_KEY],
    [ExternalIntegrationProvider.RESEND]: [
        IntegrationKeyType.API_KEY,
        IntegrationKeyType.FROM_EMAIL,
        IntegrationKeyType.WEBHOOK_SECRET,
    ],
    [ExternalIntegrationProvider.SMTP]: [
        IntegrationKeyType.HOST,
        IntegrationKeyType.PORT,
        IntegrationKeyType.USERNAME,
        IntegrationKeyType.PASSWORD,
        IntegrationKeyType.FROM_EMAIL,
        IntegrationKeyType.FROM_NAME,
    ],
    [ExternalIntegrationProvider.TWILIO]: [
        IntegrationKeyType.ACCOUNT_SID,
        IntegrationKeyType.AUTH_TOKEN,
    ],
    [ExternalIntegrationProvider.APIFY]: [IntegrationKeyType.API_KEY],
    [ExternalIntegrationProvider.HUBSPOT]: [IntegrationKeyType.ACCESS_TOKEN],
};

export const KEY_TYPE_LABELS: Record<IntegrationKeyType, string> = {
    [IntegrationKeyType.API_KEY]: 'API key',
    [IntegrationKeyType.WEBHOOK_SECRET]: 'Webhook secret',
    [IntegrationKeyType.ACCOUNT_SID]: 'Account SID',
    [IntegrationKeyType.AUTH_TOKEN]: 'Auth token',
    [IntegrationKeyType.ACCESS_TOKEN]: 'Access token',
    [IntegrationKeyType.HOST]: 'Host',
    [IntegrationKeyType.PORT]: 'Port',
    [IntegrationKeyType.USERNAME]: 'Username',
    [IntegrationKeyType.PASSWORD]: 'Password',
    [IntegrationKeyType.FROM_EMAIL]: 'From email',
    [IntegrationKeyType.FROM_NAME]: 'Sender name',
};

export const KEY_TYPE_PLACEHOLDERS: Record<IntegrationKeyType, string> = {
    [IntegrationKeyType.API_KEY]: 'sk-... / re_... / apify_api_...',
    [IntegrationKeyType.WEBHOOK_SECRET]: 'whsec_...',
    [IntegrationKeyType.ACCOUNT_SID]: 'AC...',
    [IntegrationKeyType.AUTH_TOKEN]: 'Auth token',
    [IntegrationKeyType.ACCESS_TOKEN]: 'pat-...',
    [IntegrationKeyType.HOST]: 'smtp.example.com',
    [IntegrationKeyType.PORT]: '587',
    [IntegrationKeyType.USERNAME]: 'user@example.com',
    [IntegrationKeyType.PASSWORD]: 'App password',
    [IntegrationKeyType.FROM_EMAIL]: 'noreply@example.com',
    [IntegrationKeyType.FROM_NAME]: 'Acme Sales',
};

export const OPTIONAL_PROVIDER_KEY_TYPES: Partial<
    Record<ExternalIntegrationProvider, IntegrationKeyType[]>
> = {
    [ExternalIntegrationProvider.SMTP]: [IntegrationKeyType.FROM_NAME],
};

export function requiredKeyTypesForProvider(
    provider: ExternalIntegrationProvider,
): IntegrationKeyType[] {
    const optional = new Set(OPTIONAL_PROVIDER_KEY_TYPES[provider] ?? []);
    return PROVIDER_KEY_TYPES[provider].filter((key_type) => !optional.has(key_type));
}

export function isKeyTypeAllowedForProvider(
    provider: ExternalIntegrationProvider,
    key_type: IntegrationKeyType,
): boolean {
    return PROVIDER_KEY_TYPES[provider].includes(key_type);
}

const SMTP_DISPLAYABLE_KEY_TYPES = new Set<IntegrationKeyType>([
    IntegrationKeyType.HOST,
    IntegrationKeyType.PORT,
    IntegrationKeyType.USERNAME,
    IntegrationKeyType.FROM_EMAIL,
    IntegrationKeyType.FROM_NAME,
]);

const RESEND_DISPLAYABLE_KEY_TYPES = new Set<IntegrationKeyType>([
    IntegrationKeyType.FROM_EMAIL,
]);

export function shouldExposeIntegrationKeyDisplayValue(
    provider: ExternalIntegrationProvider,
    key_type: IntegrationKeyType,
): boolean {
    if (
        provider === ExternalIntegrationProvider.SMTP &&
        SMTP_DISPLAYABLE_KEY_TYPES.has(key_type)
    ) {
        return true;
    }
    return (
        provider === ExternalIntegrationProvider.RESEND &&
        RESEND_DISPLAYABLE_KEY_TYPES.has(key_type)
    );
}

export function formatIntegrationKeyEnvName(
    provider: ExternalIntegrationProvider,
    key_type: IntegrationKeyType,
    account: string,
): string {
    return `${provider}_${key_type}_${account.trim()}`;
}

export const MULTI_ACCOUNT_INTEGRATION_PROVIDERS: ExternalIntegrationProvider[] = [
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.SMTP,
    ExternalIntegrationProvider.TWILIO,
];

export const DEFAULT_ACCOUNT_SELECTION_PROVIDERS: ExternalIntegrationProvider[] = [
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.SMTP,
];

export function providerAllowsMultipleAccounts(
    provider: ExternalIntegrationProvider,
): boolean {
    return MULTI_ACCOUNT_INTEGRATION_PROVIDERS.includes(provider);
}

export function providerSupportsDefaultAccountSelection(
    provider: ExternalIntegrationProvider,
): boolean {
    return DEFAULT_ACCOUNT_SELECTION_PROVIDERS.includes(provider);
}

export function listDistinctIntegrationAccounts(keys: { account: string }[]): string[] {
    return [...new Set(keys.map((key) => key.account.trim()))].sort((left, right) =>
        left.localeCompare(right, undefined, { numeric: true }),
    );
}

export function resolveEffectiveDefaultAccount(
    stored: string | null | undefined,
    keys: { account: string }[],
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

export function suggestNextIntegrationAccount(
    keys: { account: string }[],
): string {
    const accounts = listDistinctIntegrationAccounts(keys);
    if (accounts.length === 0) {
        return '1';
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
