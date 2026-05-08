import { z } from "zod";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";

const linkedinConfigSchema = z.object({
    keywords: z.string().min(1, "Keywords are required"),
    location: z.string().optional(),
    industry: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
});

const googleMapsConfigSchema = z.object({
    query: z.string().min(1, "Query is required"),
    location: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
});

const manualConfigSchema = z.record(z.string(), z.string());

const channelSchema = z
    .array(z.enum([Channel.EMAIL, Channel.SMS, Channel.LINKEDIN]))
    .min(1, "Select at least one channel");

const baseSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    enabled: z.boolean(),
    cron_schedule: z.string().optional(),
    channels: channelSchema,
    ai_instructions: z.string().max(2000).optional(),
});

export const FilterFormSchema = z.discriminatedUnion("source_type", [
    baseSchema.extend({
        source_type: z.literal(SourceType.LINKEDIN),
        query_config: linkedinConfigSchema,
    }),
    baseSchema.extend({
        source_type: z.literal(SourceType.GOOGLE_MAPS),
        query_config: googleMapsConfigSchema,
    }),
    baseSchema.extend({
        source_type: z.literal(SourceType.MANUAL),
        query_config: manualConfigSchema,
    }),
]);

export type FilterFormValues = z.infer<typeof FilterFormSchema>;
