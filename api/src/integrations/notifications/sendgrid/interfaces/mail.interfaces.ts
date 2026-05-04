export interface CreateEmail {
    to: string;
    subject: string;
    text?: string;
    from?: string;
    html?: any;
    attachments?: any[];
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    headers?: Record<string, string>;
    template_id?: string;
    dynamic_template_data?: Record<string, any>;
}

export interface CreateContact {
    email: string;
    first_name?: string;
    last_name?: string;
    external_id?: string;
    list_id?: string;
}

export interface AddRecipientsToList {
    list_id: string;
    recipients_ids: string[];
}

export interface EmailFromAddress {
    verification: string;
    confirmation: string;
}

export interface GetListRecipients {
    list_id: string;
    page?: number;
    page_size?: number;
}

export const EmailTemplates = {
    CLIENT_BOOKING_CONFIRMATION: 'client-booking-confirmation',
    CLIENT_BOOKING_COMPLETION: 'client-booking-completion',
    CLIENT_BOOKING_UPDATE: 'client-booking-update',
    CLIENT_BOOKING_CANCELLATION: 'client-booking-cancellation',
    PROVIDER_BOOKING_CREATION: 'provider-booking-creation',
    PROVIDER_BOOKING_CANCELLATION: 'provider-booking-cancellation',
    CHAT_GROUP_MESSAGE: 'chat-group-message',
    CHAT_INTERNAL_MESSAGE: 'chat-internal-message',
    CHAT_CLIENT_MESSAGE_CONFIRMATION: 'chat-client-message-confirmation',
    CAMPAIGN_MESSAGE: 'campaign-message',
} as const;

export type EmailTemplate = (typeof EmailTemplates)[keyof typeof EmailTemplates];


