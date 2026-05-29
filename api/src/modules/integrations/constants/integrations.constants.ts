import { ExternalIntegrationProvider } from '@/generated/prisma';

export const INTEGRATION_PROVIDERS: ExternalIntegrationProvider[] = [
    ExternalIntegrationProvider.OPENAI,
    ExternalIntegrationProvider.ANTHROPIC,
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.TWILIO,
    ExternalIntegrationProvider.APIFY,
    ExternalIntegrationProvider.HUBSPOT,
];

export const INTEGRATION_PROVIDER_LABELS: Record<
    ExternalIntegrationProvider,
    string
> = {
    [ExternalIntegrationProvider.OPENAI]: 'OpenAI',
    [ExternalIntegrationProvider.ANTHROPIC]: 'Anthropic',
    [ExternalIntegrationProvider.RESEND]: 'Resend',
    [ExternalIntegrationProvider.TWILIO]: 'Twilio',
    [ExternalIntegrationProvider.APIFY]: 'Apify',
    [ExternalIntegrationProvider.HUBSPOT]: 'HubSpot',
};

export const INTEGRATION_PROVIDER_DESCRIPTIONS: Record<
    ExternalIntegrationProvider,
    string
> = {
    [ExternalIntegrationProvider.OPENAI]:
        'GPT models for enrichment, scoring, and message drafting.',
    [ExternalIntegrationProvider.ANTHROPIC]: 'Claude models for AI workflows.',
    [ExternalIntegrationProvider.RESEND]:
        'Transactional email and inbound webhooks.',
    [ExternalIntegrationProvider.TWILIO]: 'SMS outreach credentials.',
    [ExternalIntegrationProvider.APIFY]:
        'Lead scraping from LinkedIn, Google Maps, and more.',
    [ExternalIntegrationProvider.HUBSPOT]: 'CRM sync and marketing automation.',
};
