import { z } from "zod";
import { IntegrationProviders } from "../interfaces/integrations.interface";

const providerValues = Object.values(IntegrationProviders) as [
    (typeof IntegrationProviders)[keyof typeof IntegrationProviders],
    ...(typeof IntegrationProviders)[keyof typeof IntegrationProviders][],
];

export const integrationCredentialSchema = z.object({
    provider: z.enum(providerValues),
    kind: z
        .string()
        .min(1)
        .max(64)
        .regex(/^[a-z][a-z0-9_]*$/),
    account: z
        .string()
        .min(1)
        .max(32)
        .regex(/^[a-zA-Z0-9_-]+$/),
    secret: z.string().min(1).max(4096),
});

export const integrationCredentialUpdateSchema = z.object({
    secret: z.string().min(1).max(4096),
});

export type IntegrationCredentialFormData = z.infer<
    typeof integrationCredentialSchema
>;
