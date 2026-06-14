import type { Channel, Contact } from "@/features/contacts/interfaces/contact.interface";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";

export const CampaignType = {
    STANDARD: "STANDARD",
    PERSONALIZED: "PERSONALIZED",
} as const;

export type CampaignType = (typeof CampaignType)[keyof typeof CampaignType];

export const CampaignStatuses = {
    DRAFT: "DRAFT",
    DRAFTS_READY: "DRAFTS_READY",
    SCHEDULED: "SCHEDULED",
    SENDING: "SENDING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED",
} as const;

export type CampaignStatuses = (typeof CampaignStatuses)[keyof typeof CampaignStatuses];

export const CampaignContactStatuses = {
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

export type CampaignContactStatuses =
    (typeof CampaignContactStatuses)[keyof typeof CampaignContactStatuses];

export interface CampaignFilters extends ContactFilters {
    lead_uuid?: string;
    contact_list_uuid?: string;
    exclude_uuids?: string[];
}

export interface MarketingCampaign {
    uuid: string;
    user_uuid: string;
    name: string;
    description: string | null;
    status: CampaignStatuses;
    campaign_type: CampaignType;
    channels: Channel[];
    filters_snapshot: CampaignFilters | null;
    email_subject: string | null;
    email_content: string | null;
    sms_content: string | null;
    linkedin_content: string | null;
    ai_prompt: string | null;
    use_openai_batch: boolean;
    draft_batch_id: string | null;
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
    website_visit_count: number;
    booking_visit_count: number;
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
    status: CampaignContactStatuses;
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
    status?: CampaignStatuses;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListCampaignContactsQuery {
    status?: CampaignContactStatuses;
    channel?: Channel;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateCampaignPayload {
    name: string;
    description?: string;
    campaign_type?: CampaignType;
    channels: Channel[];
    email_subject?: string;
    email_content?: string;
    sms_content?: string;
    linkedin_content?: string;
    ai_prompt?: string;
    use_openai_batch?: boolean;
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

export interface DraftMessage {
    uuid: string;
    contact_uuid: string;
    channel: Channel;
    subject: string | null;
    content: string;
    status: string;
    created_at: string;
    contact: {
        uuid: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        company: string | null;
    };
}

export interface PaginatedDraftMessages {
    data: DraftMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
