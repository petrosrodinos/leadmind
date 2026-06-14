import { useEffect, useMemo, useRef, useState } from "react";
import type { ContactAudienceScope } from "@/features/contact-audience-stats/interfaces/contact-audience-stats.interface";
import { useContactAudienceStats } from "@/features/contact-audience-stats/hooks/use-contact-audience-stats";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import {
    AudienceStatsFiltersBar,
    dateRangeFromPreset,
    type DateRangePreset,
} from "./audience-stats-filters-bar";
import { AudienceStatsSections } from "./audience-stats-sections";
import { AudiencePipelineDistribution } from "./audience-pipeline-distribution";
import { AudienceAiAnalysisSection } from "./audience-ai-analysis-section";

interface ContactAudienceAnalyticsPanelProps {
    scope: ContactAudienceScope;
    showSourceFilter?: boolean;
}

export function ContactAudienceAnalyticsPanel({
    scope,
    showSourceFilter = true,
}: ContactAudienceAnalyticsPanelProps) {
    const [preset, setPreset] = useState<DateRangePreset>("30d");
    const [contactFilters, setContactFilters] = useState<ContactFilters>({});
    const [debouncedFilters, setDebouncedFilters] = useState<ContactFilters>({});

    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setDebouncedFilters((prev) => {
                const next = contactFilters;
                if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
                return next;
            });
        }, 300);
        return () => {
            if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
        };
    }, [contactFilters]);

    const statsQuery = useMemo(() => {
        const range = dateRangeFromPreset(preset);
        return {
            ...debouncedFilters,
            ...range,
        };
    }, [preset, debouncedFilters]);

    const { data: stats, isLoading, isFetching } = useContactAudienceStats(scope, statsQuery);
    const loading = isLoading || isFetching;

    return (
        <div className="flex flex-col gap-6">
            <AudienceAiAnalysisSection scope={scope} />

            <AudienceStatsFiltersBar
                preset={preset}
                onPresetChange={setPreset}
                contactFilters={contactFilters}
                onContactFiltersChange={(patch) => setContactFilters((prev) => ({ ...prev, ...patch }))}
                showSourceFilter={showSourceFilter}
            />

            <AudiencePipelineDistribution
                byStatus={stats?.pipeline.by_status}
                total={stats?.pipeline.total_contacts ?? 0}
                isLoading={loading}
            />

            <AudienceStatsSections stats={stats} isLoading={loading} />
        </div>
    );
}
