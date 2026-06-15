import { z } from "zod";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import { SourceType } from "@/features/leads/interfaces/lead.interface";

const linkedinConfigSchema = z.object({
    keywords: z.string().min(1, "Keywords are required"),
    seniority: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
    company_location: z.array(z.string()).optional(),
    companyIndustries: z.array(z.string()).optional(),
    company_size: z.array(z.string()).optional(),
    company_revenue: z.array(z.string()).optional(),
    limit: z.coerce.number().int().positive().optional(),
    only_with_email: z.boolean().optional(),
});

const googleMapsConfigSchema = z.object({
    query: z.string().min(1, "Query is required"),
    location: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
});

/**
 * UI-side schema for the Apify generic-lead-finder (Apollo) actor.
 *
 * Enum-constrained fields are stored as string[] (driven by MultiSelect
 * dropdowns) — the actor rejects values that don't exactly match its
 * allowed enums. Free-text fields stay as comma-separated strings and get
 * split on submit.
 */
const genericLeadConfigSchema = z.object({
    titles: z.string().optional(),
    industries: z.array(z.string()).optional(),
    industry_keywords: z.string().optional(),
    seniority: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    company_size: z.array(z.string()).optional(),
    revenue: z.array(z.string()).optional(),
    person_country: z.array(z.string()).optional(),
    company_country: z.array(z.string()).optional(),
    business_model: z.array(z.string()).optional(),
    company_domains: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    limit: z.coerce.number().int().positive().optional(),
});

const gemiConfigSchema = z.object({
    name: z.string().optional(),
    activities: z.array(z.string()).optional(),
    prefectures: z.array(z.string()).optional(),
    legalTypes: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional(),
    isActive: z.enum(["", "true", "false"]).optional(),
    maxLeads: z.coerce.number().int().positive().optional(),
});

const manualConfigSchema = z.record(z.string(), z.string());

const channelSchema = z
    .array(z.enum([Channel.EMAIL, Channel.SMS, Channel.LINKEDIN, Channel.PHONE_CALL]))
    .min(1, "Select at least one channel");

const enrichmentSourcesSchema = z.array(z.nativeEnum(EnrichmentSource));

const baseSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    enabled: z.boolean(),
    cron_schedule: z.string().optional(),
    enrichment_sources: enrichmentSourcesSchema,
    channels: channelSchema,
    scoring_instruction_uuids: z.array(z.string().uuid()).optional(),
    outreach_instructions: z.string().max(2000).optional(),
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
        source_type: z.literal(SourceType.GEMI),
        query_config: gemiConfigSchema,
    }),
    baseSchema.extend({
        source_type: z.literal(SourceType.MANUAL),
        query_config: manualConfigSchema,
    }),
]);

export type FilterFormValues = z.infer<typeof FilterFormSchema>;
