export const IntegrationProviders = {
    OPENAI: "OPENAI",
    ANTHROPIC: "ANTHROPIC",
    RESEND: "RESEND",
    SMTP: "SMTP",
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
    HOST: "HOST",
    PORT: "PORT",
    USERNAME: "USERNAME",
    PASSWORD: "PASSWORD",
    FROM_EMAIL: "FROM_EMAIL",
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
    supports_default_account_selection?: boolean;
    default_account: string | null;
    keyTypes: IntegrationKeyTypeOption[];
    keys: IntegrationKey[];
}

export interface SetDefaultIntegrationAccountPayload {
    account: string;
}

export type EmailDeliveryProvider = "RESEND" | "SMTP";

export interface EmailProviderTarget {
    provider: EmailDeliveryProvider;
    account: string;
}

export interface EmailProviderAllocation extends EmailProviderTarget {
    count: number;
}

export interface CreateIntegrationKeyPayload {
    key_type: IntegrationKeyType;
    account: string;
    secret: string;
}

export interface UpdateIntegrationKeyPayload {
    secret: string;
}
