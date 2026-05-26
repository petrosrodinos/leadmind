import { ExternalIntegrationProvider } from '@/generated/prisma';

export interface IntegrationKeyResponse {
    uuid: string;
    title: string;
    last4: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface IntegrationResponse {
    provider: ExternalIntegrationProvider;
    uuid: string | null;
    title: string | null;
    keys: IntegrationKeyResponse[];
}
