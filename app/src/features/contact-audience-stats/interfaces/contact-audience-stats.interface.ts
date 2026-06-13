import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import type { CallOutcome } from "@/features/contacts/interfaces/contact.interface";
import type { MeetingOutcome } from "@/features/contacts/interfaces/contact.interface";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";

export interface ContactAudienceStatsQuery extends ContactFilters {
    from?: string;
    to?: string;
}

export interface ContactAudiencePipelineStats {
    total_contacts: number;
    by_status: Record<LeadStatus, number>;
    conversion_rate: number;
    close_rate: number;
    loss_rate: number;
    active_pipeline: number;
}

export interface ContactAudienceMeetingStats {
    total: number;
    by_outcome: Record<MeetingOutcome, number>;
    contacts_with_meetings: number;
    no_show_rate: number | null;
    meeting_close_rate: number | null;
}

export interface ContactAudienceCallStats {
    total: number;
    by_outcome: Record<CallOutcome, number>;
    connect_rate: number | null;
}

export interface ContactAudienceEngagementStats {
    with_email: number;
    with_phone: number;
    never_contacted: number;
    emails_opened: number;
    links_clicked: number;
    replies_received: number;
    website_visits: number;
    booking_visits: number;
}

export interface ContactAudienceActivityStats {
    total_interactions: number;
    notes: number;
    status_changes: number;
}

export interface ContactAudienceStats {
    pipeline: ContactAudiencePipelineStats;
    meetings: ContactAudienceMeetingStats;
    calls: ContactAudienceCallStats;
    engagement: ContactAudienceEngagementStats;
    activity: ContactAudienceActivityStats;
}

export type ContactAudienceScope =
    | { type: "filter"; uuid: string }
    | { type: "list"; uuid: string };
