import { ExternalIntegrationProvider } from '@/generated/prisma';

export interface EmailProviderTarget {
    provider: typeof ExternalIntegrationProvider.RESEND | typeof ExternalIntegrationProvider.SMTP;
    account: string;
}

export interface EmailProviderAllocation extends EmailProviderTarget {
    count: number;
}

export interface SmtpConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string | null;
}

export interface SendableEmailAccount extends EmailProviderTarget {
    label: string;
}
