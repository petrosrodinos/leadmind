import { Channel, type CreateMessagePayload } from "@/features/contacts/interfaces/contact.interface";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";

export const EMPTY_MESSAGE_COMPOSER_VALUE: MessageComposerValue = {
    emailSubject: "",
    emailContent: "",
    smsContent: "",
    callContent: "",
    linkedinContent: "",
};

export function isComposerContentEmpty(channel: Channel, value: MessageComposerValue): boolean {
    if (channel === Channel.EMAIL) return isEmailHtmlEmpty(value.emailContent);
    if (channel === Channel.PHONE_CALL) return value.callContent.trim().length === 0;
    return value.smsContent.trim().length === 0;
}

export function getComposerBodyContent(channel: Channel, value: MessageComposerValue): string {
    if (channel === Channel.EMAIL) return value.emailContent;
    if (channel === Channel.PHONE_CALL) return value.callContent;
    return value.smsContent;
}

export function buildCreateMessagePayload(
    channel: Channel,
    value: MessageComposerValue,
    contact_uuid: string,
): CreateMessagePayload {
    const content = getComposerBodyContent(channel, value);
    const subject =
        channel === Channel.EMAIL && value.emailSubject.trim() ? value.emailSubject.trim() : undefined;
    return {
        channel,
        content,
        contact_uuid,
        ...(subject ? { subject } : {}),
    };
}
