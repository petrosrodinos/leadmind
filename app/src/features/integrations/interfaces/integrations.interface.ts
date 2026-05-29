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

export interface IntegrationCredentialKind {
    kind: string;
    label: string;
    placeholder: string;
}

export interface IntegrationCredential {
    uuid: string;
    provider: IntegrationProvider;
    account: string;
    kind: string;
    label: string;
    env_name: string;
    last4: string | null;
    created_at: string;
    updated_at: string;
}

export interface IntegrationProviderView {
    provider: IntegrationProvider;
    label: string;
    description: string;
    credentialKinds: IntegrationCredentialKind[];
    credentials: IntegrationCredential[];
}

export interface CreateIntegrationCredentialPayload {
    provider: IntegrationProvider;
    kind: string;
    account: string;
    secret: string;
}

export interface UpdateIntegrationCredentialPayload {
    secret: string;
}
