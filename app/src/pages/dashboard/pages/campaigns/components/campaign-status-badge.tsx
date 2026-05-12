import { Chip } from "@heroui/react";
import {
    CheckCircle2,
    CircleDashed,
    Clock,
    Send,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import {
    CampaignStatus,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";

const META: Record<
    CampaignStatus,
    {
        label: string;
        color: "default" | "accent" | "success" | "warning" | "danger";
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    DRAFT: { label: "Draft", color: "default", icon: CircleDashed },
    SCHEDULED: { label: "Scheduled", color: "warning", icon: Clock },
    SENDING: { label: "Sending", color: "accent", icon: Send },
    COMPLETED: { label: "Completed", color: "success", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "default", icon: XCircle },
    FAILED: { label: "Failed", color: "danger", icon: AlertTriangle },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
    const meta = META[status];
    const Icon = meta.icon;
    return (
        <Chip size="sm" variant="soft" color={meta.color}>
            <Icon className="size-3" />
            <Chip.Label>{meta.label}</Chip.Label>
        </Chip>
    );
}
