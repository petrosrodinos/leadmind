import { Chip } from "@heroui/react";
import {
    SOURCE_CHIP_COLOR,
    SOURCE_ICON,
    SOURCE_LABEL,
} from "@/features/leads/constants/source-options";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
    source: SourceType;
    size?: "sm" | "md" | "lg";
    iconOnly?: boolean;
    className?: string;
}

export function SourceBadge({
    source,
    size = "sm",
    iconOnly = false,
    className,
}: SourceBadgeProps) {
    const Icon = SOURCE_ICON[source];
    const color = SOURCE_CHIP_COLOR[source];
    return (
        <Chip
            size={size}
            variant="soft"
            color={color}
            className={cn(className)}
            aria-label={SOURCE_LABEL[source]}
        >
            <Icon className="size-3.5 shrink-0" />
            {!iconOnly && <Chip.Label>{SOURCE_LABEL[source]}</Chip.Label>}
        </Chip>
    );
}
