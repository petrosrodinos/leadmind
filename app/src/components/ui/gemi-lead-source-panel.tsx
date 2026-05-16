import type { Lead } from "@/features/leads/interfaces/lead.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { parseGemiCompany } from "@/features/gemi/utils/gemi-profile.utils";
import { GemiCompanyPanel } from "@/components/ui/gemi-company-panel";

interface GemiLeadSourcePanelProps {
    lead: Pick<Lead, "source_type" | "raw_data">;
}

export function GemiLeadSourcePanel({ lead }: GemiLeadSourcePanelProps) {
    if (lead.source_type !== SourceType.GEMI) return null;
    const company = parseGemiCompany(lead.raw_data);
    if (!company) return null;
    return <GemiCompanyPanel company={company} />;
}
