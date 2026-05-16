import { usePermission } from "@/hooks/use-permission";
import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";

interface StatTile {
    label: string;
    value: number;
    accent?: "neutral" | "primary" | "success" | "warning" | "error";
}

export function StatsCards({ campaign }: { campaign: MarketingCampaign }) {
    const canViewExtendedStats = usePermission("campaign_extended_stats");

    const tiles: StatTile[] = [
        { label: "Contacts", value: campaign.selected_contact_count, accent: "neutral" },
        { label: "Messages", value: campaign.total_messages, accent: "neutral" },
        { label: "Sent", value: campaign.sent_count, accent: "primary" },
        { label: "Delivered", value: campaign.delivered_count, accent: "success" },
        { label: "Opened", value: campaign.opened_count, accent: "success" },
        { label: "Failed", value: campaign.failed_count, accent: "error" },
        ...(canViewExtendedStats ? [
            { label: "Clicked", value: campaign.clicked_count, accent: "success" as const },
            { label: "Replied", value: campaign.replied_count, accent: "success" as const },
            { label: "Skipped", value: campaign.skipped_count, accent: "neutral" as const },
            { label: "Bounced", value: campaign.bounced_count, accent: "error" as const },
            { label: "Unsubscribed", value: campaign.unsubscribed_count, accent: "warning" as const },
            { label: "Queued", value: campaign.queued_count, accent: "neutral" as const },
        ] : []),
    ];

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {tiles.map((tile) => (
                <Tile key={tile.label} {...tile} />
            ))}
        </div>
    );
}

function Tile({ label, value, accent = "neutral" }: StatTile) {
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
            <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
        </div>
    );
}
