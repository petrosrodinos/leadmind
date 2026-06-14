import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import type { ListContactsQuery } from "@/features/contacts/interfaces/contact.interface";
import { isLeadStatus } from "@/features/contacts/constants/contacts.constants";
import { isContactProfileField } from "@/features/contacts/constants/contact-profile-fields.constants";
import { SourceType, type SourceType as SourceTypeValue } from "@/features/leads/interfaces/lead.interface";
import { parseScoreRulesParam, serializeScoreRulesParam } from "@/lib/contact-score-rules";

const isSourceType = (value: string | null): value is SourceTypeValue =>
    !!value && (Object.values(SourceType) as string[]).includes(value);

function parseTagsParam(searchParams: URLSearchParams): string[] {
    const repeated = searchParams.getAll("tags").flatMap((entry) =>
        entry
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
    );
    if (repeated.length > 0) return [...new Set(repeated)];

    const bracketed = searchParams.getAll("tags[]").map((tag) => tag.trim()).filter(Boolean);
    if (bracketed.length > 0) return [...new Set(bracketed)];

    return [];
}

function parseBooleanParam(value: string | null): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
}

export function parseContactFiltersFromSearchParams(
    searchParams: URLSearchParams,
): ContactFilters {
    const profileFieldParam = searchParams.get("profile_field");
    const profileField = isContactProfileField(profileFieldParam) ? profileFieldParam : undefined;
    const hasProfileField = profileField
        ? parseBooleanParam(searchParams.get("has_profile_field")) ?? true
        : undefined;
    const statusParam = searchParams.get("status");

    const tags = parseTagsParam(searchParams);

    const sourceTypeParam = searchParams.get("source_type");

    return {
        search: searchParams.get("search") || undefined,
        filter_uuid: searchParams.get("filter_uuid") || undefined,
        status: isLeadStatus(statusParam) ? statusParam : undefined,
        source_type: isSourceType(sourceTypeParam) ? sourceTypeParam : undefined,
        tags: tags.length > 0 ? tags : undefined,
        score_rules: (() => {
            const rules = parseScoreRulesParam(searchParams.get("score_rules"));
            return rules.length > 0 ? rules : undefined;
        })(),
        profile_field: profileField,
        has_profile_field: hasProfileField,
        last_interaction_after: searchParams.get("last_interaction_after") || undefined,
        last_interaction_before: searchParams.get("last_interaction_before") || undefined,
        never_contacted: parseBooleanParam(searchParams.get("never_contacted")),
        include_unsubscribed: parseBooleanParam(searchParams.get("include_unsubscribed")),
        has_email: parseBooleanParam(searchParams.get("has_email")),
        has_phone: parseBooleanParam(searchParams.get("has_phone")),
    };
}

export function serializeContactFiltersToSearchParams(
    filters: ContactFilters,
): Record<string, string | undefined> {
    const scoreRules = serializeScoreRulesParam(filters.score_rules ?? []);

    return {
        search: filters.search,
        filter_uuid: filters.filter_uuid,
        status: filters.status,
        source_type: filters.source_type,
        tags: filters.tags?.length ? filters.tags.join(",") : undefined,
        score_rules: scoreRules,
        profile_field: filters.profile_field,
        has_profile_field:
            filters.profile_field && filters.has_profile_field !== undefined
                ? String(filters.has_profile_field)
                : undefined,
        last_interaction_after: filters.last_interaction_after,
        last_interaction_before: filters.last_interaction_before,
        never_contacted:
            filters.never_contacted !== undefined ? String(filters.never_contacted) : undefined,
        include_unsubscribed:
            filters.include_unsubscribed !== undefined
                ? String(filters.include_unsubscribed)
                : undefined,
        has_email: filters.has_email !== undefined ? String(filters.has_email) : undefined,
        has_phone: filters.has_phone !== undefined ? String(filters.has_phone) : undefined,
    };
}

export function contactFiltersToListQuery(
    filters: ContactFilters,
    pagination?: Pick<ListContactsQuery, "page" | "limit" | "exclude_list_uuid">,
): ListContactsQuery {
    return {
        ...filters,
        page: pagination?.page,
        limit: pagination?.limit,
        exclude_list_uuid: pagination?.exclude_list_uuid,
    };
}

export function buildContactListApiParams(
    query: ListContactsQuery = {},
): Record<string, string | number | undefined> {
    const params: Record<string, string | number | undefined> = {};

    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.search) params.search = query.search;
    if (query.status) params.status = query.status;
    if (query.source_type) params.source_type = query.source_type;
    if (query.filter_uuid) params.filter_uuid = query.filter_uuid;
    if (query.lead_uuid) params.lead_uuid = query.lead_uuid;
    if (query.exclude_list_uuid) params.exclude_list_uuid = query.exclude_list_uuid;
    if (query.profile_field) params.profile_field = query.profile_field;
    if (query.last_interaction_after) params.last_interaction_after = query.last_interaction_after;
    if (query.last_interaction_before) params.last_interaction_before = query.last_interaction_before;

    if (query.tags?.length) params.tags = query.tags.join(",");
    if (query.score_rules?.length) params.score_rules = JSON.stringify(query.score_rules);

    if (query.has_profile_field !== undefined) {
        params.has_profile_field = String(query.has_profile_field);
    }
    if (query.never_contacted !== undefined) params.never_contacted = String(query.never_contacted);
    if (query.include_unsubscribed !== undefined) {
        params.include_unsubscribed = String(query.include_unsubscribed);
    }

    return params;
}
