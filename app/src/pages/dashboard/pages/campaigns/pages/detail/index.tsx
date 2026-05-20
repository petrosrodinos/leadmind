import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Label, ListBox, Select } from "@heroui/react";
import { ChevronLeft, Send } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCampaign,
    useCampaignContacts,
    useSendPersonalizedDrafts,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import {
    CampaignContactStatuses,
    CampaignType,
    CampaignStatuses,
    type CampaignContactStatuses as CampaignContactStatus,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { Routes } from "@/routes/routes";
import { CampaignStatusBadge } from "../../components/campaign-status-badge";
import { StatsCards } from "../../components/stats-cards";
import { CampaignAnalytics } from "../../components/campaign-analytics";
import { RecipientsTable } from "../../components/recipients-table";
import { CampaignActionsDropdown } from "../../components/campaign-actions-dropdown";
import { CampaignDetailSkeleton } from "../../components/campaign-detail-skeleton";
import { DraftedMessagesTable } from "../../components/drafted-messages-table";

const RECIPIENT_STATUS_OPTIONS: { id: CampaignContactStatus | "ALL"; label: string }[] = [
    { id: "ALL", label: "All statuses" },
    { id: CampaignContactStatuses.PENDING, label: "Pending" },
    { id: CampaignContactStatuses.QUEUED, label: "Queued" },
    { id: CampaignContactStatuses.SENT, label: "Sent" },
    { id: CampaignContactStatuses.DELIVERED, label: "Delivered" },
    { id: CampaignContactStatuses.OPENED, label: "Opened" },
    { id: CampaignContactStatuses.CLICKED, label: "Clicked" },
    { id: CampaignContactStatuses.REPLIED, label: "Replied" },
    { id: CampaignContactStatuses.FAILED, label: "Failed" },
    { id: CampaignContactStatuses.SKIPPED, label: "Skipped" },
    { id: CampaignContactStatuses.BOUNCED, label: "Bounced" },
    { id: CampaignContactStatuses.UNSUBSCRIBED, label: "Unsubscribed" },
];

export default function CampaignDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [recipientStatus, setRecipientStatus] = useState<CampaignContactStatus | "ALL">("ALL");
    const { data: campaign, isLoading } = useCampaign(uuid);
    const { data: contactsPage } = useCampaignContacts(uuid, {
        limit: 100,
        status: recipientStatus === "ALL" ? undefined : recipientStatus,
    });
    const sendDraftsMutation = useSendPersonalizedDrafts();

    if (isLoading || !campaign) {
        return <CampaignDetailSkeleton />;
    }

    const isPersonalized = campaign.campaign_type === CampaignType.PERSONALIZED;
    const isDraftsReady = campaign.status === CampaignStatuses.DRAFTS_READY;

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
                <div className="flex items-center gap-2">
                    {isPersonalized && isDraftsReady && (
                        <ActionButtonWithPending
                            onPress={() => sendDraftsMutation.mutate(campaign.uuid)}
                            isPending={sendDraftsMutation.isPending}
                            idleLeading={<Send className="size-4" />}
                        >
                            Send Campaign
                        </ActionButtonWithPending>
                    )}
                    <CampaignActionsDropdown
                        campaign={campaign}
                        onDeleted={() => navigate(Routes.dashboard.campaigns)}
                    />
                </div>
            </header>

            <StatsCards campaign={campaign} />
            <CampaignAnalytics campaign={campaign} />

            {isPersonalized && (isDraftsReady || campaign.status === CampaignStatuses.SENDING || campaign.status === CampaignStatuses.COMPLETED) ? (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Drafted Messages</h2>
                    <DraftedMessagesTable campaignUuid={campaign.uuid} />
                </section>
            ) : (
                <section className="space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <h2 className="text-sm font-semibold text-foreground">Recipients</h2>
                        <div className="w-52">
                            <Label className="text-xs text-muted mb-1 block">Filter by status</Label>
                            <Select
                                aria-label="Filter recipients by status"
                                selectedKey={recipientStatus}
                                onSelectionChange={(key) =>
                                    setRecipientStatus((key as CampaignContactStatus | "ALL") ?? "ALL")
                                }
                            >
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        {RECIPIENT_STATUS_OPTIONS.map((option) => (
                                            <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                                                {option.label}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>
                    </div>
                    <RecipientsTable rows={contactsPage?.data ?? []} />
                    {contactsPage && contactsPage.total > (contactsPage.data?.length ?? 0) && (
                        <p className="text-xs text-muted text-center">
                            Showing first {contactsPage.data.length} of {contactsPage.total}.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}
