import {
    ExternalIntegrationProvider,
    IntegrationKeyType,
} from '@/generated/prisma';

export interface IntegrationKeyTypeOption {
    key_type: IntegrationKeyType;
    label: string;
    placeholder: string;
}

export interface IntegrationKeyResponse {
    uuid: string;
    key_type: IntegrationKeyType;
    account: string;
    label: string;
    env_name: string;
    last4: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface IntegrationResponse {
    provider: ExternalIntegrationProvider;
    uuid: string | null;
    label: string;
    description: string;
    keyTypes: IntegrationKeyTypeOption[];
    keys: IntegrationKeyResponse[];
}
