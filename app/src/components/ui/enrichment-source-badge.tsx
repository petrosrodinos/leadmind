import { Chip } from "@heroui/react";
import {
    ENRICHMENT_SOURCE_CHIP_COLOR,
    ENRICHMENT_SOURCE_ICON,
    ENRICHMENT_SOURCE_LABEL,
    type EnrichmentSource,
} from "@/features/lead-enrichment/constants/enrichment-sources";
import { cn } from "@/lib/utils";

interface EnrichmentSourceBadgeProps {
    source: EnrichmentSource;
    size?: "sm" | "md" | "lg";
    iconOnly?: boolean;
    className?: string;
}

export function EnrichmentSourceBadge({
    source,
    size = "sm",
    iconOnly = false,
    className,
}: EnrichmentSourceBadgeProps) {
    const Icon = ENRICHMENT_SOURCE_ICON[source];
    const color = ENRICHMENT_SOURCE_CHIP_COLOR[source];
    return (
        <Chip size={size} variant="soft" color={color} className={cn(className)} aria-label={ENRICHMENT_SOURCE_LABEL[source]}>
            <Icon className="size-3.5 shrink-0" />
            {!iconOnly && <Chip.Label>{ENRICHMENT_SOURCE_LABEL[source]}</Chip.Label>}
        </Chip>
    );
}
