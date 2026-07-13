import { Channel } from "@/features/contacts/interfaces/contact.interface";

export interface MessageTemplate {
    uuid: string;
    user_uuid: string;
    name: string;
    channels: Channel[];
    email_subject: string | null;
    email_content: string | null;
    sms_content: string | null;
    source_campaign_uuid: string | null;
    source_message_uuid: string | null;
    created_at: string;
    updated_at: string;
}

export type CreateMessageTemplatePayload = {
    name: string;
    channels: Channel[];
    email_subject?: string;
    email_content?: string;
    sms_content?: string;
};

export type UpdateMessageTemplatePayload = Partial<CreateMessageTemplatePayload>;

export type CreateTemplateFromSourcePayload = {
    name?: string;
};

export type GenerateTemplateMessagePayload = {
    channel: Channel;
    action: string;
    prompt?: string;
    language?: string;
    current_subject?: string;
    current_content?: string;
};

export type GenerateTemplateMessageResult = {
    subject: string | null;
    content: string;
};
