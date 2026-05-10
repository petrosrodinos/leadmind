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
        | typeof SourceType.MANUAL) ?? SourceType.LINKEDIN;
    const channels = (initial?.channels?.length
        ? initial.channels
        : [Channel.EMAIL]) as Channel[];
    const cron_schedule = initial?.cron_schedule ?? "";
    const ai_instructions = initial?.ai_instructions ?? "";
    const enabled = initial?.enabled ?? true;
    const name = initial?.name ?? "";
    const cfg = (initial?.query_config ?? {}) as Record<string, any>;
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
            ai_instructions,
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
            ai_instructions,
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
            ai_instructions,
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
        ai_instructions,
        enrichment_sources,
    };
}
