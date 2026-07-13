import { z } from "zod";
import { Channel } from "@/features/contacts/interfaces/contact.interface";

export const messageTemplateFormSchema = z
    .object({
        name: z.string().min(1, "Name is required").max(200),
        channels: z.array(z.enum([Channel.EMAIL, Channel.SMS])).min(1, "Select at least one channel"),
        email_subject: z.string().max(500).optional(),
        email_content: z.string().optional(),
        sms_content: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.channels.includes(Channel.EMAIL) && !data.email_content?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email content is required",
                path: ["email_content"],
            });
        }
        if (data.channels.includes(Channel.SMS) && !data.sms_content?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "SMS content is required",
                path: ["sms_content"],
            });
        }
    });

export type MessageTemplateFormValues = z.infer<typeof messageTemplateFormSchema>;

export const createTemplateFromSourceSchema = z.object({
    name: z.string().min(1, "Name is required").max(200).optional(),
});

export type CreateTemplateFromSourceFormValues = z.infer<typeof createTemplateFromSourceSchema>;
