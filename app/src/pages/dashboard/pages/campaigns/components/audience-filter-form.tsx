import type { CampaignFilters } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { ContactFiltersForm } from "@/pages/dashboard/components/contact-filters-form";

interface AudienceFilterFormProps {
    value: CampaignFilters;
    onChange: (patch: Partial<CampaignFilters>) => void;
    disabled?: boolean;
}

export function AudienceFilterForm({
    value,
    onChange,
    disabled,
}: AudienceFilterFormProps) {
    return (
        <ContactFiltersForm
            value={value}
            onChange={onChange}
            disabled={disabled}
            sections={{ engagement: true, outreach: true }}
        />
    );
}
