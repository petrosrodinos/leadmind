import type {
    IntegrationCredentialKind,
    IntegrationProvider,
} from "../interfaces/integrations.interface";

export interface IntegrationProviderDefinition {
    provider: IntegrationProvider;
    label: string;
    description: string;
    credentialKinds: IntegrationCredentialKind[];
}

export const integrationProviderDefinitions: IntegrationProviderDefinition[] =
    [
        {
            provider: "OPENAI",
            label: "OpenAI",
            description:
                "GPT models for enrichment, scoring, and message drafting.",
            credentialKinds: [
                {
                    kind: "api_key",
                    label: "API key",
                    placeholder: "sk-...",
                },
            ],
        },
        {
            provider: "ANTHROPIC",
            label: "Anthropic",
            description: "Claude models for AI workflows.",
            credentialKinds: [
                {
                    kind: "api_key",
                    label: "API key",
                    placeholder: "sk-ant-...",
                },
            ],
        },
        {
            provider: "RESEND",
            label: "Resend",
            description: "Transactional email and inbound webhooks.",
            credentialKinds: [
                {
                    kind: "api_key",
                    label: "API key",
                    placeholder: "re_...",
                },
                {
                    kind: "webhook_secret",
                    label: "Webhook secret",
                    placeholder: "whsec_...",
                },
            ],
        },
        {
            provider: "TWILIO",
            label: "Twilio",
            description: "SMS outreach credentials.",
            credentialKinds: [
                {
                    kind: "account_sid",
                    label: "Account SID",
                    placeholder: "AC...",
                },
                {
                    kind: "auth_token",
                    label: "Auth token",
                    placeholder: "Auth token",
                },
            ],
        },
        {
            provider: "APIFY",
            label: "Apify",
            description: "Lead scraping from LinkedIn, Google Maps, and more.",
            credentialKinds: [
                {
                    kind: "api_key",
                    label: "API token",
                    placeholder: "apify_api_...",
                },
            ],
        },
        {
            provider: "HUBSPOT",
            label: "HubSpot",
            description: "CRM sync and marketing automation.",
            credentialKinds: [
                {
                    kind: "access_token",
                    label: "Access token",
                    placeholder: "pat-...",
                },
            ],
        },
    ];

const definitionsByProvider = new Map(
    integrationProviderDefinitions.map((row) => [row.provider, row]),
);

export function getIntegrationProviderDefinition(provider: IntegrationProvider) {
    return definitionsByProvider.get(provider)!;
}

export function getCredentialKindDefinition(
    provider: IntegrationProvider,
    kind: string,
) {
    return getIntegrationProviderDefinition(provider).credentialKinds.find(
        (row) => row.kind === kind,
    );
}

import type { IntegrationCredential } from "../interfaces/integrations.interface";

export function groupCredentialsByAccount(
    credentials: IntegrationCredential[],
) {
    const groups = new Map<string, IntegrationCredential[]>();
    for (const credential of credentials) {
        const list = groups.get(credential.account) ?? [];
        list.push(credential);
        groups.set(credential.account, list);
    }
    return [...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([account, items]) => ({
            account,
            credentials: items.sort((left, right) =>
                left.kind.localeCompare(right.kind),
            ),
        }));
}
