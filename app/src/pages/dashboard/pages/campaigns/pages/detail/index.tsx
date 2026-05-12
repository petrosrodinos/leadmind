import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
    useCampaign,
    useCampaignContacts,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { Routes } from "@/routes/routes";
import { CampaignStatusBadge } from "../../components/campaign-status-badge";
import { StatsCards } from "../../components/stats-cards";
import { RecipientsTable } from "../../components/recipients-table";
import { CampaignActionsDropdown } from "../../components/campaign-actions-dropdown";
import { CampaignDetailSkeleton } from "../../components/campaign-detail-skeleton";

export default function CampaignDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { data: campaign, isLoading } = useCampaign(uuid);
    const { data: contactsPage } = useCampaignContacts(uuid, { limit: 100 });

    if (isLoading || !campaign) {
        return <CampaignDetailSkeleton />;
    }

    return (
        <div className="space-y-6">
            <Link to={Routes.dashboard.campaigns} className="inline-flex items-center text-sm text-muted hover:text-foreground">
                <ChevronLeft className="size-4" /> Back to campaigns
            </Link>

            <header className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-semibold text-foreground">{campaign.name}</h1>
                        <CampaignStatusBadge status={campaign.status} />
                    </div>
                    {campaign.description && (
                        <p className="text-sm text-muted max-w-xl">{campaign.description}</p>
                    )}
                    <p className="text-xs text-muted">
                        Created {new Date(campaign.created_at).toLocaleString()}
                        {campaign.started_at &&
                            ` · started ${new Date(campaign.started_at).toLocaleString()}`}
                        {campaign.completed_at &&
                            ` · completed ${new Date(campaign.completed_at).toLocaleString()}`}
                        {campaign.cancelled_at &&
                            ` · cancelled ${new Date(campaign.cancelled_at).toLocaleString()}`}
                    </p>
                </div>
                <CampaignActionsDropdown
                    campaign={campaign}
                    onDeleted={() => navigate(Routes.dashboard.campaigns)}
                />
            </header>

            <StatsCards campaign={campaign} />

            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Recipients</h2>
                <RecipientsTable rows={contactsPage?.data ?? []} />
                {contactsPage && contactsPage.total > (contactsPage.data?.length ?? 0) && (
                    <p className="text-xs text-muted text-center">
                        Showing first {contactsPage.data.length} of {contactsPage.total}.
                    </p>
                )}
            </section>
        </div>
    );
}
