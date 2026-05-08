import { Chip } from "@heroui/react";
import {
    Briefcase,
    Building2,
    Globe,
    Hand,
    MapPin,
    Search,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { SourceType } from "../interfaces/lead.interface";
import { SOURCE_LABEL } from "../constants/source-options";

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const SOURCE_ICON: Record<SourceType, LucideIcon> = {
    [SourceType.LINKEDIN]: Briefcase,
    [SourceType.GOOGLE_MAPS]: MapPin,
    [SourceType.GOOGLE_SEARCH]: Search,
    [SourceType.GENERIC_LEAD]: Sparkles,
    [SourceType.WEBSITE_CRAWLER]: Globe,
    [SourceType.GEMI]: Building2,
    [SourceType.MANUAL]: Hand,
};

const SOURCE_COLOR: Record<SourceType, ChipColor> = {
    [SourceType.LINKEDIN]: "accent",
    [SourceType.GOOGLE_MAPS]: "danger",
    [SourceType.GOOGLE_SEARCH]: "warning",
    [SourceType.GENERIC_LEAD]: "success",
    [SourceType.WEBSITE_CRAWLER]: "default",
    [SourceType.GEMI]: "warning",
    [SourceType.MANUAL]: "default",
};

interface SourceBadgeProps {
    source: SourceType;
    size?: "sm" | "md" | "lg";
    /** Hide the label and just show the icon. */
    iconOnly?: boolean;
}

export function SourceBadge({ source, size = "sm", iconOnly = false }: SourceBadgeProps) {
    const Icon = SOURCE_ICON[source];
    const color = SOURCE_COLOR[source];
    return (
        <Chip size={size} variant="soft" color={color} aria-label={SOURCE_LABEL[source]}>
            <Icon className="size-3.5 shrink-0" />
            {!iconOnly && <Chip.Label>{SOURCE_LABEL[source]}</Chip.Label>}
        </Chip>
    );
}
