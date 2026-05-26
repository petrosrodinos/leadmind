import { z } from "zod";

export const integrationKeySchema = z.object({
    title: z.string().min(1, "Title is required").max(120),
    secret: z.string().min(1, "Secret is required").max(4096),
});

export const integrationKeyUpdateSchema = z
    .object({
        title: z.string().min(1).max(120).optional(),
        secret: z.string().min(1).max(4096).optional(),
    })
    .refine((data) => data.title !== undefined || data.secret !== undefined, {
        message: "Update title or secret",
    });

export type IntegrationKeyFormData = z.infer<typeof integrationKeySchema>;
export type IntegrationKeyUpdateFormData = z.infer<
    typeof integrationKeyUpdateSchema
>;
