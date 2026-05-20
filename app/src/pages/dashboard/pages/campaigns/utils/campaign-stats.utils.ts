import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";

export function campaignHasEmail(campaign: MarketingCampaign): boolean {
    return campaign.channels.includes(Channel.EMAIL);
}

export function campaignRate(numerator: number, denominator: number): number | null {
    if (denominator <= 0) {
        return null;
    }
    return Math.round((numerator / denominator) * 1000) / 10;
}

export function formatCampaignRate(rate: number | null): string {
    if (rate === null) {
        return "—";
    }
    return `${rate}%`;
}

export interface CampaignEngagementRates {
    deliveryRate: number | null;
    openRate: number | null;
    clickRate: number | null;
    replyRate: number | null;
    bounceRate: number | null;
    unsubscribeRate: number | null;
    failureRate: number | null;
}

export function getCampaignEngagementRates(campaign: MarketingCampaign): CampaignEngagementRates {
    const sentBase = campaign.sent_count;
    const deliveredBase = campaign.delivered_count;

    return {
        deliveryRate: campaignRate(campaign.delivered_count, sentBase),
        openRate: campaignRate(campaign.opened_count, deliveredBase),
        clickRate: campaignRate(campaign.clicked_count, deliveredBase),
        replyRate: campaignRate(campaign.replied_count, deliveredBase),
        bounceRate: campaignRate(campaign.bounced_count, sentBase),
        unsubscribeRate: campaignRate(campaign.unsubscribed_count, sentBase),
        failureRate: campaignRate(campaign.failed_count, campaign.total_messages),
    };
}
