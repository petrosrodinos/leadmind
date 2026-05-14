import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@heroui/react";
import { useCampaign } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { CampaignStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { Routes } from "@/routes/routes";
import { CampaignEditPageSkeleton } from "../../components/campaign-edit-page-skeleton";
import { CampaignWizard } from "../../components/wizard/campaign-wizard";

export default function EditCampaignPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const { data: campaign, isLoading, isError, error } = useCampaign(uuid);

    if (isLoading) {
        return <CampaignEditPageSkeleton />;
    }
    if (isError || !campaign) {
        return (
            <div className="space-y-4">
                <Link to={Routes.dashboard.campaigns} className="inline-flex items-center text-sm text-muted hover:text-foreground">
                    <ChevronLeft className="size-4" /> Back to campaigns
                </Link>
                <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-sm text-error">
                    {error instanceof Error ? error.message : "Campaign not found."}
                </div>
            </div>
        );
    }

    if (campaign.status !== CampaignStatuses.DRAFT) {
        return (
            <div className="space-y-4">
                <Link to={`/dashboard/campaigns/${campaign.uuid}`} className="inline-flex items-center text-sm text-muted hover:text-foreground">
                    <ChevronLeft className="size-4" /> Back to campaign
                </Link>
                <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
                    <h2 className="text-base font-semibold">This campaign is no longer a draft</h2>
                    <p className="text-sm text-muted">
                        It is in status <span className="font-mono">{campaign.status}</span>. Drafts
                        are the only campaigns you can edit.
                    </p>
                    <Link to={`/dashboard/campaigns/${campaign.uuid}`}>
                        <Button>Open campaign</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <Link to={Routes.dashboard.campaigns} className="inline-flex items-center text-sm text-muted hover:text-foreground">
                    <ChevronLeft className="size-4" /> Back to campaigns
                </Link>
            </div>
            <header>
                <h1 className="text-xl font-semibold text-foreground">{campaign.name || "Untitled campaign"}</h1>
                <p className="text-sm text-muted">Step through the wizard to configure and start your campaign.</p>
            </header>
            <CampaignWizard campaign={campaign} />
        </div>
    );
}
