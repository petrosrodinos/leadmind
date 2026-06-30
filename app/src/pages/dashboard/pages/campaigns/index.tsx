import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Chip, Input, TextField } from "@heroui/react";
import {
    Megaphone,
    Plus,
    Search,
} from "lucide-react";
import {
    useCampaigns,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type {
    MarketingCampaign,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { useContactTags } from "@/features/contacts/hooks/use-contacts";
import { MultiSelect } from "@/components/ui/multi-select";
import { Routes } from "@/routes/routes";
import { CampaignStatusBadge } from "./components/campaign-status-badge";
import { CampaignActionsDropdown } from "./components/campaign-actions-dropdown";

export default function CampaignsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") ?? "";
    const tagsParam = searchParams.get("tags") ?? "";
    const tags = useMemo(
        () => tagsParam.split(",").map((t) => t.trim()).filter(Boolean),
        [tagsParam],
    );

    const { data: availableTags = [] } = useContactTags();

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const { data, isLoading } = useCampaigns({
        search: search || undefined,
        tags: tags.length > 0 ? tags : undefined,
        limit: 50,
    });

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
                    <p className="text-sm text-muted max-w-xl">
                        Send templated email and SMS to a filtered set of contacts. Track delivery,
                        opens, clicks, and unsubscribes.
                    </p>
                </div>
                <Button onPress={() => navigate(Routes.dashboard.campaigns_new)}>
                    <Plus className="size-4" />
                    New campaign
                </Button>
            </header>

            <div className="flex flex-wrap gap-3 items-end">
                <div className="w-72 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                    <TextField name="search" className="w-full">
                        <Input
                            className="pl-9"
                            placeholder="Search by name or description"
                            value={search}
                            onChange={(e) => updateParams({ search: e.target.value || null })}
                        />
                    </TextField>
                </div>
                {availableTags.length > 0 && (
                    <div className="w-60">
                        <MultiSelect
                            options={availableTags}
                            value={tags}
                            onChange={(next) =>
                                updateParams({ tags: next.length > 0 ? next.join(",") : null })
                            }
                            placeholder="Filter by tags"
                            aria-label="Filter campaigns by tags"
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <SkeletonRows />
            ) : !data || data.data.length === 0 ? (
                <EmptyState onCreate={() => navigate(Routes.dashboard.campaigns_new)} />
            ) : (
                <ul className="grid gap-3">
                    {data.data.map((c) => (
                        <li key={c.uuid}>
                            <CampaignRow campaign={c} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function CampaignRow({ campaign }: { campaign: MarketingCampaign }) {
    const href =
        campaign.status === CampaignStatuses.DRAFT && !campaign.draft_batch_id
            ? `/dashboard/campaigns/${campaign.uuid}/edit`
            : `/dashboard/campaigns/${campaign.uuid}`;
    return (
        <article className="rounded-xl border border-border bg-surface p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
            <Link to={href} className="flex-1 min-w-0 flex gap-4 items-start">
                <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                    <Megaphone className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                            {campaign.name}
                        </h3>
                        <CampaignStatusBadge status={campaign.status} />
                        {campaign.channels.map((c) => (
                            <Chip key={c} size="sm" variant="soft" color="default">
                                <Chip.Label>{c}</Chip.Label>
                            </Chip>
                        ))}
                    </div>
                    {campaign.description && (
                        <p className="text-xs text-muted truncate mt-0.5">
                            {campaign.description}
                        </p>
                    )}
                    <p className="text-xs text-muted mt-1">
                        {campaign.selected_contact_count} contacts · {campaign.sent_count} sent ·{" "}
                        {campaign.delivered_count} delivered
                        {campaign.opened_count > 0 && ` · ${campaign.opened_count} opened`}
                        {campaign.clicked_count > 0 && ` · ${campaign.clicked_count} clicked`}
                        {campaign.replied_count > 0 && ` · ${campaign.replied_count} replied`}
                        {campaign.website_visit_count > 0 &&
                            ` · ${campaign.website_visit_count} site visits`}
                        {campaign.booking_visit_count > 0 &&
                            ` · ${campaign.booking_visit_count} booking visits`}
                        {campaign.bounced_count > 0 && ` · ${campaign.bounced_count} bounced`}
                        {" · "}
                        {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                </div>
            </Link>
            <CampaignActionsDropdown campaign={campaign} />
        </article>
    );
}

function SkeletonRows() {
    return (
        <ul className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <li
                    key={i}
                    className="rounded-xl border border-border bg-surface p-4 animate-pulse"
                >
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-surface-secondary" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 rounded bg-surface-secondary" />
                            <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="rounded-xl border border-dashed border-border bg-surface-secondary/40 p-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                <Megaphone className="size-6" />
            </div>
            <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">No campaigns yet</h2>
                <p className="text-sm text-muted max-w-md mx-auto">
                    Send a templated email or SMS to many contacts at once. Pick filters, write the
                    message, and let the queue handle the rest.
                </p>
            </div>
            <Button onPress={onCreate}>
                <Plus className="size-4" />
                Create your first campaign
            </Button>
        </div>
    );
}
