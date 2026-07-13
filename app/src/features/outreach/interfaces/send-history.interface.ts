import type { Channel, MsgStatus } from "@/features/contacts/interfaces/contact.interface";

export const SendSource = {
    DIRECT: "direct",
    CAMPAIGN: "campaign",
} as const;

export type SendSource = (typeof SendSource)[keyof typeof SendSource];

export const EmailIntegrationProvider = {
    RESEND: "RESEND",
    SMTP: "SMTP",
} as const;

export type EmailIntegrationProvider =
    (typeof EmailIntegrationProvider)[keyof typeof EmailIntegrationProvider];

export interface SendHistoryContact {
    uuid: string;
    name: string | null;
    email: string | null;
    phone: string | null;
}

export interface SendHistoryCampaign {
    uuid: string;
    name: string;
}

export interface SendHistoryMessage {
    uuid: string;
    user_uuid: string;
    contact_uuid: string;
    campaign_uuid: string | null;
    channel: Channel;
    subject: string | null;
    content: string;
    status: MsgStatus;
    scheduled_at: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    email_provider: EmailIntegrationProvider | null;
    email_account: string | null;
    sms_provider: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    contact: SendHistoryContact;
    campaign: SendHistoryCampaign | null;
}

export interface ListSendHistoryQuery {
    page?: number;
    limit?: number;
    channel?: Channel;
    status?: MsgStatus;
    contact_uuid?: string;
    campaign_uuid?: string;
    source?: SendSource;
    email_provider?: EmailIntegrationProvider;
    search?: string;
    date_from?: string;
    date_to?: string;
    history_only?: boolean;
}

export interface SendHistoryListResponse {
    data: SendHistoryMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
