import { ExternalIntegrationProvider } from '@/generated/prisma';
import { IntegrationCredentialKindDefinition } from '../integrations.catalog';

export interface IntegrationCredentialResponse {
    uuid: string;
    provider: ExternalIntegrationProvider;
    account: string;
    kind: string;
    label: string;
    env_name: string;
    last4: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface IntegrationProviderResponse {
    provider: ExternalIntegrationProvider;
    label: string;
    description: string;
    credentialKinds: IntegrationCredentialKindDefinition[];
    credentials: IntegrationCredentialResponse[];
}
