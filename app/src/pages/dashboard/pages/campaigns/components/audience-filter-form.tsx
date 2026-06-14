import type { CampaignFilters } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { ContactFiltersForm } from "@/pages/dashboard/components/contact-filters-form";

interface AudienceFilterFormProps {
    value: CampaignFilters;
    onChange: (patch: Partial<CampaignFilters>) => void;
    disabled?: boolean;
    collapsible?: boolean;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AudienceFilterForm({
    value,
    onChange,
    disabled,
    collapsible = true,
    defaultOpen = false,
    open,
    onOpenChange,
}: AudienceFilterFormProps) {
    return (
        <ContactFiltersForm
            value={value}
            onChange={onChange}
            disabled={disabled}
            sections={{ engagement: true, outreach: true }}
            collapsible={collapsible}
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
}
