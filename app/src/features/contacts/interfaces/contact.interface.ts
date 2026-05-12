import type { Lead, SourceType } from "@/features/leads/interfaces/lead.interface";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";

export const LeadStatus = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    CONVERTED: "CONVERTED",
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
    STATUS_CHANGE: "STATUS_CHANGE",
} as const;

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType];

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

export interface Contact {
    uuid: string;
    user_uuid: string;
    lead_uuid: string;
    filter_uuid: string | null;
    status: LeadStatus;
    score: number | null;
    notes: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
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
        scoring_instructions: string | null;
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
    min_score?: number;
    tags?: string[];
    source_type?: SourceType;
    filter_uuid?: string;
    lead_uuid?: string;
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
    prompt: string;
    language?: string;
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
    title?: string;
    location?: string;
    linkedin_url?: string;
    industry?: string;
    description?: string;
    notes?: string;
}
