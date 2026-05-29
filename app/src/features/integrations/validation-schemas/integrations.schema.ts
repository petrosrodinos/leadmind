import { z } from "zod";
import { IntegrationKeyTypes } from "../interfaces/integrations.interface";

const keyTypeValues = Object.values(IntegrationKeyTypes) as [
    (typeof IntegrationKeyTypes)[keyof typeof IntegrationKeyTypes],
    ...(typeof IntegrationKeyTypes)[keyof typeof IntegrationKeyTypes][],
];

export const integrationKeySchema = z.object({
    key_type: z.enum(keyTypeValues),
    account: z
        .string()
        .min(1)
        .max(32)
        .regex(/^[a-zA-Z0-9_-]+$/),
    secret: z.string().min(1).max(4096),
});

export const integrationKeyUpdateSchema = z.object({
    secret: z.string().min(1).max(4096),
});
