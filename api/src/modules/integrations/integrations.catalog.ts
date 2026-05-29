import { ExternalIntegrationProvider } from '@/generated/prisma';

export interface IntegrationCredentialKindDefinition {
    kind: string;
    label: string;
    placeholder: string;
}

export interface IntegrationProviderDefinition {
    provider: ExternalIntegrationProvider;
    label: string;
    description: string;
    credentialKinds: IntegrationCredentialKindDefinition[];
}

export const INTEGRATION_PROVIDER_DEFINITIONS: IntegrationProviderDefinition[] =
    [
        {
            provider: ExternalIntegrationProvider.OPENAI,
            label: 'OpenAI',
            description:
                'GPT models for enrichment, scoring, and message drafting.',
            credentialKinds: [
                {
                    kind: 'api_key',
                    label: 'API key',
                    placeholder: 'sk-...',
                },
            ],
        },
        {
            provider: ExternalIntegrationProvider.ANTHROPIC,
            label: 'Anthropic',
            description: 'Claude models for AI workflows.',
            credentialKinds: [
                {
                    kind: 'api_key',
                    label: 'API key',
                    placeholder: 'sk-ant-...',
                },
            ],
        },
        {
            provider: ExternalIntegrationProvider.RESEND,
            label: 'Resend',
            description: 'Transactional email and inbound webhooks.',
            credentialKinds: [
                {
                    kind: 'api_key',
                    label: 'API key',
                    placeholder: 're_...',
                },
                {
                    kind: 'webhook_secret',
                    label: 'Webhook secret',
                    placeholder: 'whsec_...',
                },
            ],
        },
        {
            provider: ExternalIntegrationProvider.TWILIO,
            label: 'Twilio',
            description: 'SMS outreach credentials.',
            credentialKinds: [
                {
                    kind: 'account_sid',
                    label: 'Account SID',
                    placeholder: 'AC...',
                },
                {
                    kind: 'auth_token',
                    label: 'Auth token',
                    placeholder: 'Auth token',
                },
            ],
        },
        {
            provider: ExternalIntegrationProvider.APIFY,
            label: 'Apify',
            description: 'Lead scraping from LinkedIn, Google Maps, and more.',
            credentialKinds: [
                {
                    kind: 'api_key',
                    label: 'API token',
                    placeholder: 'apify_api_...',
                },
            ],
        },
        {
            provider: ExternalIntegrationProvider.HUBSPOT,
            label: 'HubSpot',
            description: 'CRM sync and marketing automation.',
            credentialKinds: [
                {
                    kind: 'access_token',
                    label: 'Access token',
                    placeholder: 'pat-...',
                },
            ],
        },
    ];

const definitionsByProvider = new Map(
    INTEGRATION_PROVIDER_DEFINITIONS.map((row) => [row.provider, row]),
);

export function getIntegrationProviderDefinition(
    provider: ExternalIntegrationProvider,
): IntegrationProviderDefinition {
    const definition = definitionsByProvider.get(provider);
    if (!definition) {
        throw new Error(`Unknown integration provider: ${provider}`);
    }
    return definition;
}

export function getCredentialKindDefinition(
    provider: ExternalIntegrationProvider,
    kind: string,
): IntegrationCredentialKindDefinition | undefined {
    return getIntegrationProviderDefinition(provider).credentialKinds.find(
        (row) => row.kind === kind,
    );
}

export function isCredentialKindAllowed(
    provider: ExternalIntegrationProvider,
    kind: string,
): boolean {
    return !!getCredentialKindDefinition(provider, kind);
}

export function formatCredentialEnvName(
    provider: ExternalIntegrationProvider,
    kind: string,
    account: string,
): string {
    const providerPart = provider.toUpperCase();
    const kindPart = kind.toUpperCase();
    const accountPart =
        account === 'default' ? '' : `_${account.toUpperCase()}`;
    return `${providerPart}_${kindPart}${accountPart}`;
}

export function formatCredentialLabel(
    provider: ExternalIntegrationProvider,
    kind: string,
    account: string,
): string {
    const kindLabel =
        getCredentialKindDefinition(provider, kind)?.label ?? kind;
    if (account === 'default') {
        return kindLabel;
    }
    return `${kindLabel} · ${account}`;
}
