import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import type { Filter } from "@/features/filters/interfaces/filter.interface";
import type { FilterFormValues } from "../../validation-schemas/filter";
import { asStringArray, joinCsv } from "./helpers";

export function buildDefaults(initial?: Filter): FilterFormValues {
    const source_type = (initial?.source_type as
        | typeof SourceType.LINKEDIN
        | typeof SourceType.GOOGLE_MAPS
        | typeof SourceType.GENERIC_LEAD
        | typeof SourceType.GEMI
        | typeof SourceType.MANUAL) ?? SourceType.LINKEDIN;
    const channels = (initial?.channels?.length
        ? initial.channels
        : [Channel.EMAIL]) as Channel[];
    const cron_schedule = initial?.cron_schedule ?? "";
    const scoring_instruction_uuids = (initial?.scoring_instructions ?? []).map((s) => s.uuid);
    const outreach_instructions = initial?.outreach_instructions ?? "";
    const enabled = initial?.enabled ?? true;
    const name = initial?.name ?? "";
    const cfg = (initial?.query_config ?? {}) as Record<string, unknown>;
    const enrichment_sources = (
        initial?.enrichment_sources?.length ? initial.enrichment_sources : []
    ) as EnrichmentSource[];

    if (source_type === SourceType.LINKEDIN) {
        return {
            name,
            source_type: SourceType.LINKEDIN,
            query_config: {
                keywords: typeof cfg.keywords === "string" ? cfg.keywords : "",
                seniority: asStringArray(cfg.seniority),
                departments: asStringArray(cfg.departments),
                location: asStringArray(cfg.location),
                company_location: asStringArray(cfg.company_location),
                companyIndustries: asStringArray(cfg.companyIndustries),
                company_size: asStringArray(cfg.company_size),
                company_revenue: asStringArray(cfg.company_revenue),
                limit: typeof cfg.limit === "number" ? cfg.limit : 100,
                only_with_email:
                    typeof cfg.only_with_email === "boolean" ? cfg.only_with_email : true,
            },
            enabled,
            cron_schedule,
            channels,
            scoring_instruction_uuids,
            outreach_instructions,
            enrichment_sources,
        };
    }
    if (source_type === SourceType.GOOGLE_MAPS) {
        return {
            name,
            source_type: SourceType.GOOGLE_MAPS,
            query_config: {
                query: typeof cfg.query === "string" ? cfg.query : "",
                location: typeof cfg.location === "string" ? cfg.location : "",
                limit: typeof cfg.limit === "number" ? cfg.limit : 100,
            },
            enabled,
            cron_schedule,
            channels,
            scoring_instruction_uuids,
            outreach_instructions,
            enrichment_sources,
        };
    }
    if (source_type === SourceType.GENERIC_LEAD) {
        return {
            name,
            source_type: SourceType.GENERIC_LEAD,
            query_config: {
                titles: joinCsv(cfg.titles),
                industry_keywords: joinCsv(cfg.industry_keywords),
                company_domains: joinCsv(cfg.company_domains),
                industries: asStringArray(cfg.industries),
                seniority: asStringArray(cfg.seniority),
                departments: asStringArray(cfg.departments),
                company_size: asStringArray(cfg.company_size),
                revenue: asStringArray(cfg.revenue),
                person_country: asStringArray(cfg.person_country),
                company_country: asStringArray(cfg.company_country),
                business_model: asStringArray(cfg.business_model),
                first_name: typeof cfg.first_name === "string" ? cfg.first_name : "",
                last_name: typeof cfg.last_name === "string" ? cfg.last_name : "",
                limit: typeof cfg.limit === "number" ? cfg.limit : 100,
            },
            enabled,
            cron_schedule,
            channels,
            scoring_instruction_uuids,
            outreach_instructions,
            enrichment_sources,
        };
    }
    if (source_type === SourceType.GEMI) {
        const isActiveRaw = cfg.isActive;
        const isActive =
            isActiveRaw === true ? "true" : isActiveRaw === false ? "false" : ("" as const);
        return {
            name,
            source_type: SourceType.GEMI,
            query_config: {
                name: typeof cfg.name === "string" ? cfg.name : "",
                activities: Array.isArray(cfg.activities) ? (cfg.activities as string[]).join(", ") : "",
                prefectures: Array.isArray(cfg.prefectures) ? (cfg.prefectures as (string | number)[]).map(String) : [],
                legalTypes: Array.isArray(cfg.legalTypes) ? (cfg.legalTypes as (string | number)[]).map(String) : [],
                statuses: Array.isArray(cfg.statuses) ? (cfg.statuses as (string | number)[]).map(String) : [],
                isActive,
                maxLeads: typeof cfg.maxLeads === "number" ? cfg.maxLeads : 100,
            },
            enabled,
            cron_schedule,
            channels,
            scoring_instruction_uuids,
            outreach_instructions,
            enrichment_sources,
        };
    }
    const manualConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(cfg)) {
        if (typeof v === "string") manualConfig[k] = v;
        else if (v != null) manualConfig[k] = String(v);
    }
    return {
        name,
        source_type: SourceType.MANUAL,
        query_config: manualConfig,
        enabled,
        cron_schedule,
        channels,
        scoring_instruction_uuids,
        outreach_instructions,
        enrichment_sources,
    };
}
