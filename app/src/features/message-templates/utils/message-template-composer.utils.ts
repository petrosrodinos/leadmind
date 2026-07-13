import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import type { MessageTemplate } from "../interfaces/message-template.interface";

export function messageTemplateToComposerValue(template: MessageTemplate): MessageComposerValue {
    return {
        emailSubject: template.email_subject ?? "",
        emailContent: template.email_content ?? "",
        smsContent: template.sms_content ?? "",
        callContent: "",
        linkedinContent: "",
    };
}

export function filterTemplatesForChannels(
    templates: MessageTemplate[],
    allowedChannels: Channel[],
): MessageTemplate[] {
    const allowed = new Set(allowedChannels);
    return templates.filter((template) => template.channels.some((channel) => allowed.has(channel)));
}

export function mergeTemplateIntoComposer(
    current: MessageComposerValue,
    template: MessageTemplate,
): MessageComposerValue {
    const next = { ...current };
    if (template.channels.includes(Channel.EMAIL)) {
        next.emailSubject = template.email_subject ?? "";
        next.emailContent = template.email_content ?? "";
    }
    if (template.channels.includes(Channel.SMS)) {
        next.smsContent = template.sms_content ?? "";
    }
    return next;
}

export function preferredChannelAfterTemplateApply(template: MessageTemplate): Channel | null {
    if (template.channels.includes(Channel.EMAIL) && template.email_content && !isEmailHtmlEmpty(template.email_content)) {
        return Channel.EMAIL;
    }
    if (template.channels.includes(Channel.SMS) && template.sms_content?.trim()) {
        return Channel.SMS;
    }
    return template.channels[0] ?? null;
}
