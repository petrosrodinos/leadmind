import { SourceType } from "@/features/leads/interfaces/lead.interface";
import type { FilterFormValues } from "../../validation-schemas/filter";
import { splitCsv } from "./helpers";

export function serializeQueryConfig(values: FilterFormValues): Record<string, unknown> {
    let cfg: Record<string, unknown> = { ...(values.query_config as object) };

    if (values.source_type === SourceType.GENERIC_LEAD) {
        const cs = values.query_config as Record<string, any>;
        const arrayKeys = [
            "industries",
            "seniority",
            "departments",
            "company_size",
            "revenue",
            "person_country",
            "company_country",
            "business_model",
        ] as const;
        const out: Record<string, unknown> = {};
        for (const k of arrayKeys) {
            if (Array.isArray(cs[k]) && cs[k].length > 0) out[k] = cs[k];
        }
        const titles = splitCsv(cs.titles);
        if (titles) out.titles = titles;
        const ik = splitCsv(cs.industry_keywords);
        if (ik) out.industry_keywords = ik;
        const cd = splitCsv(cs.company_domains);
        if (cd) out.company_domains = cd;
        if (cs.first_name) out.first_name = cs.first_name;
        if (cs.last_name) out.last_name = cs.last_name;
        if (cs.limit != null) out.limit = cs.limit;
        cfg = out;
    } else if (values.source_type === SourceType.LINKEDIN) {
        const cs = values.query_config as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        if (typeof cs.keywords === "string" && cs.keywords.trim()) {
            out.keywords = cs.keywords.trim();
        }
        for (const k of [
            "seniority",
            "departments",
            "location",
            "company_location",
            "companyIndustries",
            "company_size",
            "company_revenue",
        ] as const) {
            if (Array.isArray(cs[k]) && cs[k].length > 0) out[k] = cs[k];
        }
        if (cs.limit != null && cs.limit !== "") out.limit = Number(cs.limit);
        if (typeof cs.only_with_email === "boolean") {
            out.only_with_email = cs.only_with_email;
        }
        cfg = out;
    } else {
        for (const k of Object.keys(cfg)) {
            if (cfg[k] === "" || cfg[k] == null) delete cfg[k];
        }
    }

    return cfg;
}
