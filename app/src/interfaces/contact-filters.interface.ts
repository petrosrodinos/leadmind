import type { ContactScoreRule, LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import type { ContactProfileField } from "@/features/contacts/constants/contact-profile-fields.constants";
import type { SourceType } from "@/features/leads/interfaces/lead.interface";

export interface ContactFilters {
    search?: string;
    filter_uuid?: string;
    source_type?: SourceType;
    status?: LeadStatus;
    tags?: string[];
    score_rules?: ContactScoreRule[];
    profile_field?: ContactProfileField;
    has_profile_field?: boolean;
    last_interaction_after?: string;
    last_interaction_before?: string;
    never_contacted?: boolean;
    include_unsubscribed?: boolean;
    has_email?: boolean;
    has_phone?: boolean;
}

export interface ContactFiltersFormSections {
    engagement?: boolean;
    outreach?: boolean;
}
