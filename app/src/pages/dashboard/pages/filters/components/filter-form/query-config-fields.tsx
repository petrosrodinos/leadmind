import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { Suspense, lazy } from "react";
import { Spinner } from "@heroui/react";
import { ManualQuerySection } from "./manual-key-value-editor";
import type { FilterQueryFieldsProps } from "./types";

const LinkedInQueryFields = lazy(() =>
    import("./linkedin-query-fields").then((m) => ({ default: m.LinkedInQueryFields })),
);
const GoogleMapsQueryFields = lazy(() =>
    import("./google-maps-query-fields").then((m) => ({ default: m.GoogleMapsQueryFields })),
);
const GenericLeadQueryFields = lazy(() =>
    import("./generic-lead-query-fields").then((m) => ({ default: m.GenericLeadQueryFields })),
);
const GemiQueryFields = lazy(() =>
    import("./gemi-query-fields").then((m) => ({ default: m.GemiQueryFields })),
);

function QueryFieldsFallback() {
    return (
        <div className="flex items-center justify-center rounded-lg border border-border/60 bg-surface-secondary/40 p-6">
            <Spinner size="md" />
        </div>
    );
}

export function QueryConfigFields(props: FilterQueryFieldsProps) {
    const { sourceType } = props;
    if (sourceType === SourceType.LINKEDIN) {
        return (
            <Suspense fallback={<QueryFieldsFallback />}>
                <LinkedInQueryFields {...props} />
            </Suspense>
        );
    }
    if (sourceType === SourceType.GOOGLE_MAPS) {
        return (
            <Suspense fallback={<QueryFieldsFallback />}>
                <GoogleMapsQueryFields {...props} />
            </Suspense>
        );
    }
    if (sourceType === SourceType.GENERIC_LEAD) {
        return (
            <Suspense fallback={<QueryFieldsFallback />}>
                <GenericLeadQueryFields {...props} />
            </Suspense>
        );
    }
    if (sourceType === SourceType.GEMI) {
        return (
            <Suspense fallback={<QueryFieldsFallback />}>
                <GemiQueryFields {...props} />
            </Suspense>
        );
    }
    return <ManualQuerySection control={props.control} />;
}
