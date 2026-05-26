import { ExternalIntegrationProvider } from '@/generated/prisma';

export const INTEGRATION_PROVIDERS = [
    ExternalIntegrationProvider.OPENAI,
    ExternalIntegrationProvider.ANTHROPIC,
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.TWILIO,
    ExternalIntegrationProvider.APIFY,
    ExternalIntegrationProvider.HUBSPOT,
] as const;
