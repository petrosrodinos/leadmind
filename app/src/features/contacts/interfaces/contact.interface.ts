import type { ContactProfileField } from "../constants/contact-profile-fields.constants";
import type { Lead, SourceType } from "@/features/leads/interfaces/lead.interface";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";

export const LeadStatus = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    QUALIFIED: "QUALIFIED",
    NURTURING: "NURTURING",
    CONVERTED: "CONVERTED",
    LOST: "LOST",
    ARCHIVED: "ARCHIVED",
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const Channel = {
    EMAIL: "EMAIL",
    SMS: "SMS",
    LINKEDIN: "LINKEDIN",
} as const;

export type Channel = (typeof Channel)[keyof typeof Channel];

export const MsgStatus = {
    PENDING: "PENDING",
    SENT: "SENT",
    FAILED: "FAILED",
} as const;

export type MsgStatus = (typeof MsgStatus)[keyof typeof MsgStatus];

export const InteractionType = {
    NOTE: "NOTE",
    CALL: "CALL",
    EMAIL: "EMAIL",
    SMS: "SMS",
    MEETING: "MEETING",
    STATUS_CHANGE: "STATUS_CHANGE",
    CAMPAIGN_EMAIL_SENT: "CAMPAIGN_EMAIL_SENT",
    CAMPAIGN_SMS_SENT: "CAMPAIGN_SMS_SENT",
    EMAIL_DELIVERED: "EMAIL_DELIVERED",
    SMS_DELIVERED: "SMS_DELIVERED",
    EMAIL_OPENED: "EMAIL_OPENED",
    LINK_CLICKED: "LINK_CLICKED",
    WEBSITE_VISIT: "WEBSITE_VISIT",
    BOOKING_VISIT: "BOOKING_VISIT",
    REPLY_RECEIVED: "REPLY_RECEIVED",
    EMAIL_BOUNCED: "EMAIL_BOUNCED",
    EMAIL_FAILED: "EMAIL_FAILED",
    SMS_FAILED: "SMS_FAILED",
    UNSUBSCRIBED: "UNSUBSCRIBED",
} as const;

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType];

export const CallOutcome = {
    CONNECTED: "CONNECTED",
    NO_ANSWER: "NO_ANSWER",
    VOICEMAIL: "VOICEMAIL",
    BUSY: "BUSY",
} as const;

export type CallOutcome = (typeof CallOutcome)[keyof typeof CallOutcome];

export const CallDirection = {
    OUTBOUND: "OUTBOUND",
    INBOUND: "INBOUND",
} as const;

export type CallDirection = (typeof CallDirection)[keyof typeof CallDirection];

export interface CallMetadata {
    outcome: CallOutcome;
    direction: CallDirection;
    duration_minutes?: number;
    occurred_at?: string;
}

export interface MeetingMetadata {
    occurred_at: string;
    duration_minutes?: number;
    location?: string;
}

export interface LogCallPayload {
    outcome: CallOutcome;
    direction: CallDirection;
    duration_minutes?: number;
    occurred_at?: string;
    content?: string;
}

export interface LogMeetingPayload {
    occurred_at: string;
    duration_minutes?: number;
    location?: string;
    content?: string;
}

export interface MessageMetadata {
    direction: CallDirection;
    subject?: string;
    occurred_at?: string;
}

export interface LogEmailPayload {
    direction: CallDirection;
    subject?: string;
    occurred_at?: string;
    content?: string;
}

export interface LogSmsPayload {
    direction: CallDirection;
    occurred_at?: string;
    content?: string;
}

export interface InteractionStatusChange {
    from: LeadStatus;
    to: LeadStatus;
}

export interface OutreachMessage {
    uuid: string;
    user_uuid: string;
    contact_uuid: string;
    channel: Channel;
    subject: string | null;
    content: string;
    status: MsgStatus;
    scheduled_at: string | null;
    sent_at: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface InteractionOutreachRef {
    uuid: string;
    subject: string | null;
    channel: Channel;
    status: MsgStatus;
    sent_at: string | null;
}

export interface Interaction {
    uuid: string;
    contact_uuid: string;
    user_uuid: string;
    type: InteractionType;
    content: string | null;
    metadata: Record<string, unknown> | null;
    status_change: InteractionStatusChange | null;
    outreach_message_uuid: string | null;
    outreach_message: InteractionOutreachRef | null;
    created_at: string;
    updated_at: string;
}

export interface ContactScoreRule {
    scoring_instruction_uuid: string;
    min: number;
}

export interface ContactScoreRow {
    scoring_instruction_uuid: string;
    score: number;
    scoring_instruction?: {
        uuid: string;
        name: string;
    };
}

export interface Contact {
    uuid: string;
    user_uuid: string;
    lead_uuid: string;
    filter_uuid: string | null;
    status: LeadStatus;
    contact_scores?: ContactScoreRow[];
    notes: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
    google_maps_url: string | null;
    linkedin_url: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    tags: string[];
    lead: Lead;
    filter?: {
        uuid: string;
        enrichment_sources: EnrichmentSource[];
        scoring_instructions: Array<{
            uuid: string;
            name: string;
            instructions: string;
        }>;
        outreach_instructions: string | null;
    } | null;
    outreach_messages?: OutreachMessage[];
    interactions?: Interaction[];
}

export interface ListContactsQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: LeadStatus;
    score_rules?: ContactScoreRule[];
    tags?: string[];
    source_type?: SourceType;
    filter_uuid?: string;
    lead_uuid?: string;
    profile_field?: ContactProfileField;
    has_profile_field?: boolean;
    exclude_list_uuid?: string;
    last_interaction_after?: string;
    last_interaction_before?: string;
    never_contacted?: boolean;
    include_unsubscribed?: boolean;
}

export interface PaginatedContacts {
    data: Contact[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UpdateMessagePayload {
    subject?: string;
    content?: string;
}

export interface CreateMessagePayload {
    channel: Channel;
    content: string;
    subject?: string;
    contact_uuid: string;
}

export interface AiDraftMessagePayload {
    contact_uuid: string;
    channel: Channel;
    action?: string;
    prompt?: string;
    language?: string;
    current_subject?: string;
    current_content?: string;
}

export interface AiDraftMessageResult {
    subject: string | null;
    content: string;
}

export interface CreateContactPayload {
    filter_uuid: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    google_maps_url?: string;
    title?: string;
    location?: string;
    linkedin_url?: string;
    industry?: string;
    description?: string;
    tags?: string[];
    notes?: string;
}

export interface UpdateContactPayload {
    filter_uuid?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    google_maps_url?: string;
    title?: string;
    location?: string;
    linkedin_url?: string;
    industry?: string;
    description?: string;
    notes?: string;
}

export interface BulkTriggerContactScorePayload {
    contact_uuids: string[];
    filter_uuids: string[];
    scoring_instruction_uuids: string[];
    use_batch?: boolean;
}

export type BulkTriggerContactScoreResult =
    | { jobIds: string[]; queued: number; skipped_contacts: number; is_batch: false }
    | { batch_id: string; queued: number; skipped_contacts: number; is_batch: true };
