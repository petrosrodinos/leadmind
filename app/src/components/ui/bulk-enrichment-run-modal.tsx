import {
    EnrichmentRunModal,
    type EnrichmentActionMode,
    type EnrichmentRunModalProps,
} from "@/components/ui/enrichment-action-popover";

const ENTITY_LABEL: Record<EnrichmentActionMode, string> = {
    lead: "lead",
    contact: "contact",
};

export function bulkEnrichmentContextHint(mode: EnrichmentActionMode, count: number): string | undefined {
    if (count <= 0) return undefined;
    const label = ENTITY_LABEL[mode];
    return `One job per selected ${label} (${count}). Same sources for all.`;
}

export type BulkEnrichmentRunModalProps = Omit<EnrichmentRunModalProps, "contextHint" | "onEnrich"> & {
    selectedCount: number;
    onEnrich: EnrichmentRunModalProps["onEnrich"];
    contextHint?: string;
};

export function BulkEnrichmentRunModal({
    selectedCount,
    contextHint,
    ...props
}: BulkEnrichmentRunModalProps) {
    return (
        <EnrichmentRunModal
            {...props}
            contextHint={contextHint ?? bulkEnrichmentContextHint(props.mode, selectedCount)}
        />
    );
}
