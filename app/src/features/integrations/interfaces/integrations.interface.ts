export const IntegrationProviders = {
    OPENAI: "OPENAI",
    ANTHROPIC: "ANTHROPIC",
    RESEND: "RESEND",
    TWILIO: "TWILIO",
    APIFY: "APIFY",
    HUBSPOT: "HUBSPOT",
} as const;

export type IntegrationProvider =
    (typeof IntegrationProviders)[keyof typeof IntegrationProviders];

export const IntegrationKeyTypes = {
    API_KEY: "API_KEY",
    WEBHOOK_SECRET: "WEBHOOK_SECRET",
    ACCOUNT_SID: "ACCOUNT_SID",
    AUTH_TOKEN: "AUTH_TOKEN",
    ACCESS_TOKEN: "ACCESS_TOKEN",
} as const;

export type IntegrationKeyType =
    (typeof IntegrationKeyTypes)[keyof typeof IntegrationKeyTypes];

export interface IntegrationKeyTypeOption {
    key_type: IntegrationKeyType;
    label: string;
    placeholder: string;
}

export interface IntegrationKey {
    uuid: string;
    key_type: IntegrationKeyType;
    account: string;
    label: string;
    env_name: string;
    last4: string | null;
    created_at: string;
    updated_at: string;
}

export interface IntegrationProviderView {
    provider: IntegrationProvider;
    uuid: string | null;
    label: string;
    description: string;
    disabled?: boolean;
    allows_multiple_accounts?: boolean;
    keyTypes: IntegrationKeyTypeOption[];
    keys: IntegrationKey[];
}

export interface CreateIntegrationKeyPayload {
    key_type: IntegrationKeyType;
    account: string;
    secret: string;
}

export interface UpdateIntegrationKeyPayload {
    secret: string;
}
