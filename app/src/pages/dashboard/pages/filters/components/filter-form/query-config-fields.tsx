import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { LinkedInQueryFields } from "./linkedin-query-fields";
import { GoogleMapsQueryFields } from "./google-maps-query-fields";
import { GenericLeadQueryFields } from "./generic-lead-query-fields";
import { GemiQueryFields } from "./gemi-query-fields";
import { ManualQuerySection } from "./manual-key-value-editor";
import type { FilterQueryFieldsProps } from "./types";

export function QueryConfigFields(props: FilterQueryFieldsProps) {
    const { sourceType } = props;
    if (sourceType === SourceType.LINKEDIN) {
        return <LinkedInQueryFields {...props} />;
    }
    if (sourceType === SourceType.GOOGLE_MAPS) {
        return <GoogleMapsQueryFields {...props} />;
    }
    if (sourceType === SourceType.GENERIC_LEAD) {
        return <GenericLeadQueryFields {...props} />;
    }
    if (sourceType === SourceType.GEMI) {
        return <GemiQueryFields {...props} />;
    }
    return <ManualQuerySection control={props.control} />;
}
