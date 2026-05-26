import type { IntegrationProvider } from "../interfaces/integrations.interface";

export interface IntegrationProviderMeta {
    label: string;
    description: string;
    secretLabel: string;
    secretPlaceholder: string;
}

export const integrationProviderMeta: Record<
    IntegrationProvider,
    IntegrationProviderMeta
> = {
    OPENAI: {
        label: "OpenAI",
        description: "GPT models for enrichment, scoring, and message drafting.",
        secretLabel: "API key",
        secretPlaceholder: "sk-...",
    },
    ANTHROPIC: {
        label: "Anthropic",
        description: "Claude models for AI workflows.",
        secretLabel: "API key",
        secretPlaceholder: "sk-ant-...",
    },
    RESEND: {
        label: "Resend",
        description: "Transactional and campaign email delivery.",
        secretLabel: "API key",
        secretPlaceholder: "re_...",
    },
    TWILIO: {
        label: "Twilio",
        description: "SMS outreach. Add separate keys for Account SID and Auth Token.",
        secretLabel: "Credential",
        secretPlaceholder: "Account SID or Auth Token",
    },
    APIFY: {
        label: "Apify",
        description: "Lead scraping from LinkedIn, Google Maps, and more.",
        secretLabel: "API token",
        secretPlaceholder: "apify_api_...",
    },
    HUBSPOT: {
        label: "HubSpot",
        description: "CRM sync and marketing automation.",
        secretLabel: "Access token",
        secretPlaceholder: "pat-...",
    },
};

export const integrationProviderOrder: IntegrationProvider[] = [
    "OPENAI",
    "ANTHROPIC",
    "RESEND",
    "TWILIO",
    "APIFY",
    "HUBSPOT",
];
