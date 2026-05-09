import { SourceType } from "@/features/leads/interfaces/lead.interface";
import type { FilterFormValues } from "../../validation-schemas/filter";

export const EMPTY_LINKEDIN_QUERY = {
    keywords: "",
    seniority: [],
    departments: [],
    location: [],
    company_location: [],
    companyIndustries: [],
    company_size: [],
    company_revenue: [],
    limit: 100,
    only_with_email: true,
};

export const EMPTY_GOOGLE_MAPS_QUERY = {
    query: "",
    location: "",
    limit: 100,
};

export const EMPTY_GENERIC_LEAD_QUERY = {
    titles: "",
    industry_keywords: "",
    company_domains: "",
    industries: [],
    seniority: [],
    departments: [],
    company_size: [],
    revenue: [],
    person_country: [],
    company_country: [],
    business_model: [],
    first_name: "",
    last_name: "",
    limit: 100,
};

export function resetQueryConfigForSource(
    next: FilterFormValues["source_type"],
): unknown {
    if (next === SourceType.LINKEDIN) return EMPTY_LINKEDIN_QUERY;
    if (next === SourceType.GOOGLE_MAPS) return EMPTY_GOOGLE_MAPS_QUERY;
    if (next === SourceType.GENERIC_LEAD) return EMPTY_GENERIC_LEAD_QUERY;
    return {};
}
