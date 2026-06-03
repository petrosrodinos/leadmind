import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

interface CampaignAnalyticsProps {
    campaign: MarketingCampaign;
    embedded?: boolean;
}

export function CampaignAnalytics({ campaign, embedded = false }: CampaignAnalyticsProps) {
    const [open, setOpen] = useState(false);
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
            label: "Website visits",
            count: campaign.website_visit_count,
            rate: rates.websiteVisitRate,
            tone: "bg-accent",
        },
        {
            label: "Booking visits",
            count: campaign.booking_visit_count,
            rate: rates.bookingVisitRate,
            tone: "bg-accent/80",
        },
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

    const panel = (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
            {rows.map((row) => (
                <RateBar key={row.label} row={row} maxCount={Math.max(campaign.sent_count, 1)} />
            ))}
        </div>
    );

    if (embedded) {
        return (
            <section className="space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Engagement analytics</h3>
                    <p className="text-xs text-muted">
                        {hasEmail
                            ? "Rates use delivered as the baseline for opens, clicks, and replies."
                            : "Delivery and issue rates use sent messages as the baseline."}
                    </p>
                </div>
                {panel}
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-start justify-between gap-2 text-left"
            >
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Engagement analytics</h2>
                    <p className="text-xs text-muted">
                        {hasEmail
                            ? "Rates use delivered as the baseline for opens, clicks, and replies."
                            : "Delivery and issue rates use sent messages as the baseline."}
                    </p>
                </div>
                <ChevronDown
                    className={`mt-0.5 size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open ? panel : null}
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
