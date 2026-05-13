import type { Channel, Contact, LeadStatus } from "@/features/contacts/interfaces/contact.interface";

export const CampaignStatus = {
    DRAFT: "DRAFT",
    SCHEDULED: "SCHEDULED",
    SENDING: "SENDING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED",
} as const;

export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const CampaignContactStatus = {
    PENDING: "PENDING",
    QUEUED: "QUEUED",
    SENT: "SENT",
    FAILED: "FAILED",
    SKIPPED: "SKIPPED",
    DELIVERED: "DELIVERED",
    OPENED: "OPENED",
    CLICKED: "CLICKED",
    REPLIED: "REPLIED",
    BOUNCED: "BOUNCED",
    UNSUBSCRIBED: "UNSUBSCRIBED",
} as const;

export type CampaignContactStatus =
    (typeof CampaignContactStatus)[keyof typeof CampaignContactStatus];

export interface CampaignFilters {
    status?: LeadStatus;
    tags?: string[];
    min_score?: number;
    search?: string;
    filter_uuid?: string;
    lead_uuid?: string;
    has_email?: boolean;
    has_phone?: boolean;
    last_interaction_after?: string;
    last_interaction_before?: string;
    exclude_uuids?: string[];
    include_unsubscribed?: boolean;
}

export interface MarketingCampaign {
    uuid: string;
    user_uuid: string;
    name: string;
    description: string | null;
    status: CampaignStatus;
    channels: Channel[];
    filters_snapshot: CampaignFilters | null;
    email_subject: string | null;
    email_content: string | null;
    sms_content: string | null;
    sender_profile_uuid: string | null;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    selected_contact_count: number;
    total_messages: number;
    queued_count: number;
    sent_count: number;
    failed_count: number;
    skipped_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    replied_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    created_at: string;
    updated_at: string;
}

export interface MarketingCampaignContact {
    uuid: string;
    campaign_uuid: string;
    contact_uuid: string;
    channel: Channel;
    status: CampaignContactStatus;
    error_message: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
    contact: Contact;
}

export interface PaginatedCampaigns {
    data: MarketingCampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedCampaignContacts {
    data: MarketingCampaignContact[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ListCampaignsQuery {
    status?: CampaignStatus;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListCampaignContactsQuery {
    status?: CampaignContactStatus;
    channel?: Channel;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateCampaignPayload {
    name: string;
    description?: string;
    channels: Channel[];
    email_subject?: string;
    email_content?: string;
    sms_content?: string;
    sender_profile_uuid?: string;
    scheduled_at?: string;
    filters?: CampaignFilters;
}

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export interface PreviewContactsResult {
    total: number;
    sample: Contact[];
    with_email: number;
    with_phone: number;
}

export interface GenerateCampaignMessagePayload {
    channel: Channel;
    action:
        | "generate"
        | "improve"
        | "shorten"
        | "tone_professional"
        | "tone_friendly"
        | "tone_direct"
        | "personalize";
    prompt?: string;
    language?: string;
    current_subject?: string;
    current_content?: string;
    sample_contact_uuid?: string;
}

export interface GenerateCampaignMessageResult {
    subject: string | null;
    content: string;
}
