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

export interface IntegrationKey {
    uuid: string;
    title: string;
    last4: string | null;
    created_at: string;
    updated_at: string;
}

export interface Integration {
    provider: IntegrationProvider;
    uuid: string | null;
    title: string | null;
    keys: IntegrationKey[];
}

export interface CreateIntegrationKeyPayload {
    title: string;
    secret: string;
}

export interface UpdateIntegrationKeyPayload {
    title?: string;
    secret?: string;
}
