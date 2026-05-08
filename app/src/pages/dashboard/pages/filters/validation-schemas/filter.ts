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

/**
 * UI-side schema: all comma-separated fields are kept as strings here and
 * split into string[] on submit (the Apify generic-lead-finder actor expects
 * arrays).
 */
const genericLeadConfigSchema = z.object({
    titles: z.string().optional(),
    industries: z.string().optional(),
    industry_keywords: z.string().optional(),
    company_country: z.string().optional(),
    seniority: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
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
        source_type: z.literal(SourceType.GENERIC_LEAD),
        query_config: genericLeadConfigSchema,
    }),
    baseSchema.extend({
        source_type: z.literal(SourceType.MANUAL),
        query_config: manualConfigSchema,
    }),
]);

export type FilterFormValues = z.infer<typeof FilterFormSchema>;
