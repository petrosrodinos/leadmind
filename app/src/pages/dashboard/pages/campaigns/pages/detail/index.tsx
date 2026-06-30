import { useEffect, useState } from "react";
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
import type { EmailProviderAllocation } from "@/features/integrations/interfaces/integrations.interface";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { Routes } from "@/routes/routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    EmailProviderAllocationPicker,
    isEmailProviderAllocationValid,
} from "@/features/messaging/components/email-provider-allocation-picker";
import { SenderProfileSelect } from "@/features/messaging/components/sender-profile-select";
import { CampaignStatusBadge } from "../../components/campaign-status-badge";
import { CampaignStatsSection } from "../../components/campaign-stats-section";
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
    const [confirmSend, setConfirmSend] = useState(false);
    const [emailAllocations, setEmailAllocations] = useState<EmailProviderAllocation[]>([]);
    const [senderProfileUuid, setSenderProfileUuid] = useState<string | null>(null);
    const { data: campaign, isLoading } = useCampaign(uuid);
    const { data: contactsPage } = useCampaignContacts(uuid, {
        limit: 100,
        status: recipientStatus === "ALL" ? undefined : recipientStatus,
    });
    const { data: pendingEmailContacts } = useCampaignContacts(uuid, {
        status: CampaignContactStatuses.PENDING,
        channel: Channel.EMAIL,
        limit: 1,
    });
    const sendDraftsMutation = useSendPersonalizedDrafts();

    useEffect(() => {
        if (!campaign?.sender_profile_uuid || senderProfileUuid) return;
        setSenderProfileUuid(campaign.sender_profile_uuid);
    }, [campaign?.sender_profile_uuid, senderProfileUuid]);

    if (isLoading || !campaign) {
        return <CampaignDetailSkeleton />;
    }

    const isPersonalized = campaign.campaign_type === CampaignType.PERSONALIZED;
    const isDraftsReady = campaign.status === CampaignStatuses.DRAFTS_READY;
    const batchDraftsPending = isPersonalized && !!campaign.draft_batch_id;
    const includesEmail = campaign.channels.includes(Channel.EMAIL);
    const pendingEmailCount = pendingEmailContacts?.total ?? 0;
    const showEmailAllocation = isPersonalized && includesEmail && isDraftsReady;
    const emailAllocationValid =
        !showEmailAllocation ||
        isEmailProviderAllocationValid(emailAllocations, pendingEmailCount);

    const handleSendCampaign = async () => {
        if (showEmailAllocation && !emailAllocationValid) return;
        if (!senderProfileUuid) return;
        await sendDraftsMutation.mutateAsync({
            uuid: campaign.uuid,
            ...(showEmailAllocation
                ? { email_provider_allocations: emailAllocations }
                : {}),
            sender_profile_uuid: senderProfileUuid,
        });
        setConfirmSend(false);
    };

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
                            onPress={() => setConfirmSend(true)}
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

            {batchDraftsPending && (
                <div className="rounded-xl border border-border bg-surface-secondary/40 px-4 py-3 text-sm text-muted flex flex-wrap items-center justify-between gap-3">
                    <p>
                        Personalized drafts are being generated via the OpenAI Batch API. This usually
                        completes within 24 hours — refresh this page when status shows Drafts ready.
                    </p>
                    <p className="text-xs shrink-0">
                        Changed your mind? Use <span className="font-medium text-foreground">Cancel campaign</span> in the menu above.
                    </p>
                </div>
            )}

            <CampaignStatsSection campaign={campaign} />

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

            <ConfirmDialog
                isOpen={confirmSend}
                onOpenChange={setConfirmSend}
                title="Send personalized campaign?"
                description={
                    <>
                        This will queue {pendingEmailCount} email
                        {pendingEmailCount === 1 ? "" : "s"} for delivery using your selected
                        provider accounts.
                        {showEmailAllocation ? (
                            <div className="mt-4">
                                <EmailProviderAllocationPicker
                                    totalCount={pendingEmailCount}
                                    value={emailAllocations}
                                    onChange={setEmailAllocations}
                                    disabled={sendDraftsMutation.isPending}
                                />
                            </div>
                        ) : null}
                        <div className="mt-4">
                            <SenderProfileSelect
                                value={senderProfileUuid}
                                onChange={setSenderProfileUuid}
                                disabled={sendDraftsMutation.isPending}
                            />
                        </div>
                    </>
                }
                confirmLabel="Send now"
                isPending={sendDraftsMutation.isPending}
                isConfirmDisabled={
                    (showEmailAllocation && !emailAllocationValid) || !senderProfileUuid
                }
                onConfirm={handleSendCampaign}
            />
        </div>
    );
}
