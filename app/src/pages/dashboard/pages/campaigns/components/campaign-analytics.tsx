import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import {
    campaignHasEmail,
    formatCampaignRate,
    getCampaignEngagementRates,
} from "../utils/campaign-stats.utils";

interface RateRow {
    label: string;
    count: number;
    rate: number | null;
    tone: string;
}

export function CampaignAnalytics({ campaign }: { campaign: MarketingCampaign }) {
    const hasEmail = campaignHasEmail(campaign);
    const rates = getCampaignEngagementRates(campaign);
    const hasSends = campaign.sent_count > 0;

    if (!hasSends) {
        return null;
    }

    const rows: RateRow[] = [
        {
            label: "Delivered",
            count: campaign.delivered_count,
            rate: rates.deliveryRate,
            tone: "bg-accent",
        },
    ];

    if (hasEmail) {
        rows.push(
            {
                label: "Opened",
                count: campaign.opened_count,
                rate: rates.openRate,
                tone: "bg-success",
            },
            {
                label: "Clicked",
                count: campaign.clicked_count,
                rate: rates.clickRate,
                tone: "bg-success/80",
            },
            {
                label: "Replied",
                count: campaign.replied_count,
                rate: rates.replyRate,
                tone: "bg-emerald-500",
            },
        );
    }

    rows.push(
        {
            label: "Bounced",
            count: campaign.bounced_count,
            rate: rates.bounceRate,
            tone: "bg-danger",
        },
        {
            label: "Unsubscribed",
            count: campaign.unsubscribed_count,
            rate: rates.unsubscribeRate,
            tone: "bg-warning",
        },
        {
            label: "Failed",
            count: campaign.failed_count,
            rate: rates.failureRate,
            tone: "bg-danger/70",
        },
    );

    return (
        <section className="space-y-3">
            <div>
                <h2 className="text-sm font-semibold text-foreground">Engagement analytics</h2>
                <p className="text-xs text-muted">
                    {hasEmail
                        ? "Rates use delivered as the baseline for opens, clicks, and replies."
                        : "Delivery and issue rates use sent messages as the baseline."}
                </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
                {rows.map((row) => (
                    <RateBar key={row.label} row={row} maxCount={Math.max(campaign.sent_count, 1)} />
                ))}
            </div>
        </section>
    );
}

function RateBar({ row, maxCount }: { row: RateRow; maxCount: number }) {
    const width = Math.min(100, Math.round((row.count / maxCount) * 100));

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted tabular-nums">
                    {row.count.toLocaleString()}
                    <span className="mx-1.5 text-border">·</span>
                    {formatCampaignRate(row.rate)}
                </span>
            </div>
            <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${row.tone}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}
