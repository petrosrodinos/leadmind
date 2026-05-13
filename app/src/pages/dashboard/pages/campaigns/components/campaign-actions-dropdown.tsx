import { useState } from "react";
import { Dropdown } from "@heroui/react";
import { Copy, MoreHorizontal, RefreshCw, Trash2, X } from "lucide-react";
import {
    useCancelCampaign,
    useDeleteCampaign,
    useDuplicateCampaign,
    useRerunCampaign,
} from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type { MarketingCampaign } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { CampaignStatuses } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CampaignActionsDropdownProps {
    campaign: MarketingCampaign;
    onDeleted?: () => void;
}

export function CampaignActionsDropdown({ campaign, onDeleted }: CampaignActionsDropdownProps) {
    const cancelMutation = useCancelCampaign();
    const rerunMutation = useRerunCampaign();
    const deleteMutation = useDeleteCampaign();
    const duplicateMutation = useDuplicateCampaign();
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [confirmRerun, setConfirmRerun] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const canCancel =
        campaign.status === CampaignStatuses.SENDING ||
        campaign.status === CampaignStatuses.SCHEDULED ||
        campaign.status === CampaignStatuses.DRAFTS_READY;
    const canRerun =
        campaign.status === CampaignStatuses.COMPLETED ||
        campaign.status === CampaignStatuses.CANCELLED ||
        campaign.status === CampaignStatuses.FAILED ||
        campaign.status === CampaignStatuses.DRAFTS_READY;
    const canDelete =
        campaign.status === CampaignStatuses.DRAFT ||
        campaign.status === CampaignStatuses.DRAFTS_READY ||
        campaign.status === CampaignStatuses.COMPLETED ||
        campaign.status === CampaignStatuses.CANCELLED ||
        campaign.status === CampaignStatuses.FAILED;

    return (
        <>
            <Dropdown>
                <Dropdown.Trigger
                    aria-label="Campaign actions"
                    className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-surface hover:bg-surface-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <MoreHorizontal className="size-4" />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu
                        onAction={(key) => {
                            if (key === "duplicate") duplicateMutation.mutate(campaign.uuid);
                            if (key === "rerun") setConfirmRerun(true);
                            if (key === "cancel") setConfirmCancel(true);
                            if (key === "delete") setConfirmDelete(true);
                        }}
                    >
                        <Dropdown.Item id="duplicate" textValue="Duplicate">
                            <Copy className="size-4" />
                            Duplicate
                        </Dropdown.Item>
                        {canRerun ? (
                            <Dropdown.Item id="rerun" textValue="Re-run">
                                <RefreshCw className="size-4" />
                                Re-run
                            </Dropdown.Item>
                        ) : null}
                        {canCancel ? (
                            <Dropdown.Item id="cancel" textValue="Cancel campaign" className="text-danger">
                                <X className="size-4" />
                                Cancel campaign
                            </Dropdown.Item>
                        ) : null}
                        <Dropdown.Item
                            id="delete"
                            textValue="Delete"
                            isDisabled={!canDelete}
                            className="text-danger"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>

            <ConfirmDialog
                isOpen={confirmCancel}
                onOpenChange={setConfirmCancel}
                title="Cancel this campaign?"
                description="In-flight sends will short-circuit and pending recipients will be marked skipped. This cannot be undone."
                confirmLabel="Cancel campaign"
                variant="danger"
                isPending={cancelMutation.isPending}
                onConfirm={async () => {
                    try {
                        await cancelMutation.mutateAsync(campaign.uuid);
                        setConfirmCancel(false);
                    } catch {
                        // toast surfaced
                    }
                }}
            />

            <ConfirmDialog
                isOpen={confirmRerun}
                onOpenChange={setConfirmRerun}
                title="Re-run this campaign?"
                description="All previous results will be cleared and the campaign will be sent again to the original audience. This cannot be undone."
                confirmLabel="Re-run campaign"
                variant="default"
                isPending={rerunMutation.isPending}
                onConfirm={async () => {
                    try {
                        await rerunMutation.mutateAsync(campaign.uuid);
                        setConfirmRerun(false);
                    } catch {
                        // toast surfaced
                    }
                }}
            />

            <ConfirmDialog
                isOpen={confirmDelete}
                onOpenChange={setConfirmDelete}
                title="Delete this campaign?"
                description="This campaign and all its recipient data will be permanently deleted. This cannot be undone."
                confirmLabel="Delete campaign"
                variant="danger"
                isPending={deleteMutation.isPending}
                onConfirm={async () => {
                    try {
                        await deleteMutation.mutateAsync(campaign.uuid);
                        setConfirmDelete(false);
                        onDeleted?.();
                    } catch {
                        // toast surfaced
                    }
                }}
            />
        </>
    );
}
