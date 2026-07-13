import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { DraftMessage, MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import {
    getCampaign,
    listCampaignDraftMessages,
} from "@/features/marketing-campaigns/services/marketing-campaigns.service";
import type { MessageComposerValue } from "@/features/messaging/components/message-composer";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";

export interface CampaignTemplateDraftSources {
    emailDraft?: DraftMessage | null;
    smsDraft?: DraftMessage | null;
}

export function buildComposerPrefillFromCampaign(
    campaign: MarketingCampaign,
    sources: CampaignTemplateDraftSources = {},
): MessageComposerValue {
    let emailSubject = campaign.email_subject ?? "";
    let emailContent = campaign.email_content ?? "";
    let smsContent = campaign.sms_content ?? "";

    const campaignEmailEmpty = !emailContent || isEmailHtmlEmpty(emailContent);
    const campaignSmsEmpty = !smsContent.trim();

    const emailDraft = sources.emailDraft;
    const smsDraft = sources.smsDraft;

    if (
        campaignEmailEmpty &&
        emailDraft?.channel === Channel.EMAIL &&
        emailDraft.content.trim()
    ) {
        emailSubject = emailDraft.subject ?? emailSubject;
        emailContent = emailDraft.content;
    }

    if (campaignSmsEmpty && smsDraft?.channel === Channel.SMS && smsDraft.content.trim()) {
        smsContent = smsDraft.content;
    }

    return {
        emailSubject,
        emailContent,
        smsContent,
        callContent: "",
        linkedinContent: "",
    };
}

export function defaultTemplateNameFromCampaign(campaign: MarketingCampaign, override?: string): string {
    return override?.trim() || `${campaign.name} template`;
}

export function campaignHasTemplateContent(
    campaign: MarketingCampaign,
    sources: CampaignTemplateDraftSources = {},
): boolean {
    const prefill = buildComposerPrefillFromCampaign(campaign, sources);
    const hasEmail = !isEmailHtmlEmpty(prefill.emailContent);
    const hasSms = prefill.smsContent.trim().length > 0;
    return hasEmail || hasSms;
}

export async function loadCampaignTemplatePrefill(
    campaignUuid: string,
    nameOverride?: string,
): Promise<{ prefill: MessageComposerValue; defaultName: string }> {
    const campaign = await getCampaign(campaignUuid);
    const campaignEmailEmpty =
        !campaign.email_content || isEmailHtmlEmpty(campaign.email_content);
    const campaignSmsEmpty = !campaign.sms_content?.trim();

    let emailDraft: DraftMessage | null = null;
    let smsDraft: DraftMessage | null = null;

    if (campaignEmailEmpty || campaignSmsEmpty) {
        const drafts = await listCampaignDraftMessages(campaignUuid, { page: 1, limit: 100 });
        if (campaignEmailEmpty) {
            emailDraft =
                drafts.data.find(
                    (d) => d.channel === Channel.EMAIL && d.content.trim().length > 0,
                ) ?? null;
        }
        if (campaignSmsEmpty) {
            smsDraft =
                drafts.data.find((d) => d.channel === Channel.SMS && d.content.trim().length > 0) ??
                null;
        }
    }

    const sources = { emailDraft, smsDraft };
    if (!campaignHasTemplateContent(campaign, sources)) {
        throw new Error("Campaign has no email or SMS content");
    }

    return {
        prefill: buildComposerPrefillFromCampaign(campaign, sources),
        defaultName: defaultTemplateNameFromCampaign(campaign, nameOverride),
    };
}
