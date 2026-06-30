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
        IntegrationKeyType.WEBHOOK_SECRET,
    ],
    [ExternalIntegrationProvider.SMTP]: [
        IntegrationKeyType.HOST,
        IntegrationKeyType.PORT,
        IntegrationKeyType.USERNAME,
        IntegrationKeyType.PASSWORD,
        IntegrationKeyType.FROM_EMAIL,
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
};

export function isKeyTypeAllowedForProvider(
    provider: ExternalIntegrationProvider,
    key_type: IntegrationKeyType,
): boolean {
    return PROVIDER_KEY_TYPES[provider].includes(key_type);
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

export function providerAllowsMultipleAccounts(
    provider: ExternalIntegrationProvider,
): boolean {
    return MULTI_ACCOUNT_INTEGRATION_PROVIDERS.includes(provider);
}
