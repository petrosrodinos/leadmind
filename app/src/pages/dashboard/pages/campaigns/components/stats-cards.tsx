import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import {
    campaignHasEmail,
    campaignRate,
    formatCampaignRate,
} from "../utils/campaign-stats.utils";

interface StatTile {
    label: string;
    value: number;
    sublabel?: string;
    accent?: "neutral" | "primary" | "success" | "warning" | "error";
}

interface StatSection {
    title: string;
    tiles: StatTile[];
}

export function StatsCards({ campaign }: { campaign: MarketingCampaign }) {
    const hasEmail = campaignHasEmail(campaign);
    const deliveredBase = campaign.delivered_count;
    const sentBase = campaign.sent_count;

    const sections: StatSection[] = [
        {
            title: "Audience",
            tiles: [
                { label: "Contacts", value: campaign.selected_contact_count, accent: "neutral" },
                { label: "Messages", value: campaign.total_messages, accent: "neutral" },
                { label: "Queued", value: campaign.queued_count, accent: "neutral" },
            ],
        },
        {
            title: "Delivery",
            tiles: [
                { label: "Sent", value: campaign.sent_count, accent: "primary" },
                {
                    label: "Delivered",
                    value: campaign.delivered_count,
                    sublabel: formatCampaignRate(campaignRate(campaign.delivered_count, sentBase)),
                    accent: "success",
                },
                { label: "Skipped", value: campaign.skipped_count, accent: "neutral" },
            ],
        },
    ];

    if (hasEmail) {
        sections.push({
            title: "Email engagement",
            tiles: [
                {
                    label: "Opened",
                    value: campaign.opened_count,
                    sublabel: formatCampaignRate(campaignRate(campaign.opened_count, deliveredBase)),
                    accent: "success",
                },
                {
                    label: "Clicked",
                    value: campaign.clicked_count,
                    sublabel: formatCampaignRate(campaignRate(campaign.clicked_count, deliveredBase)),
                    accent: "success",
                },
                {
                    label: "Replied",
                    value: campaign.replied_count,
                    sublabel: formatCampaignRate(campaignRate(campaign.replied_count, deliveredBase)),
                    accent: "success",
                },
            ],
        });
    }

    sections.push({
        title: "Issues",
        tiles: [
            {
                label: "Failed",
                value: campaign.failed_count,
                sublabel: formatCampaignRate(
                    campaignRate(campaign.failed_count, campaign.total_messages),
                ),
                accent: "error",
            },
            {
                label: "Bounced",
                value: campaign.bounced_count,
                sublabel: formatCampaignRate(campaignRate(campaign.bounced_count, sentBase)),
                accent: "error",
            },
            {
                label: "Unsubscribed",
                value: campaign.unsubscribed_count,
                sublabel: formatCampaignRate(campaignRate(campaign.unsubscribed_count, sentBase)),
                accent: "warning",
            },
        ],
    });

    return (
        <div className="space-y-5">
            {sections.map((section) => (
                <section key={section.title} className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {section.title}
                    </h2>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {section.tiles.map((tile) => (
                            <Tile key={tile.label} {...tile} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function Tile({ label, value, sublabel, accent = "neutral" }: StatTile) {
    const tone =
        accent === "primary"
            ? "text-accent"
            : accent === "success"
              ? "text-success"
              : accent === "warning"
                ? "text-warning"
                : accent === "error"
                  ? "text-error"
                  : "text-foreground";

    return (
        <div className="rounded-xl border border-border bg-surface p-3">
            <div className="text-xs text-muted">{label}</div>
            <div className={`text-2xl font-semibold tabular-nums ${tone}`}>
                {value.toLocaleString()}
            </div>
            {sublabel && (
                <div className="text-xs text-muted mt-0.5 tabular-nums">{sublabel}</div>
            )}
        </div>
    );
}
