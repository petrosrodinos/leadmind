import { Chip } from "@heroui/react";
import { CheckCircle2, XCircle } from "lucide-react";

type UsageStatus = "SUCCESS" | "ERROR";
type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const STATUS_META: Record<
    UsageStatus,
    { label: string; color: ChipColor; icon: React.ComponentType<{ className?: string }> }
> = {
    SUCCESS: { label: "Success", color: "success", icon: CheckCircle2 },
    ERROR: { label: "Error", color: "danger", icon: XCircle },
};

export const USAGE_STATUS_FILTER_OPTIONS = Object.entries(STATUS_META).map(([key, meta]) => ({
    key,
    label: meta.label,
}));

export function UsageStatusChip({ status }: { status: UsageStatus }) {
    const { label, color, icon: Icon } = STATUS_META[status];
    return (
        <Chip size="sm" variant="soft" color={color}>
            <Icon className="size-3" />
            <Chip.Label>{label}</Chip.Label>
        </Chip>
    );
}
