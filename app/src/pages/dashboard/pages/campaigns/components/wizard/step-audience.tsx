import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { RefreshCw, Users } from "lucide-react";
import type {
    CampaignFilters,
    PreviewContactsResult,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { usePreviewCampaignContacts } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import type { Channel } from "@/features/contacts/interfaces/contact.interface";
import { AudienceFilterForm } from "../audience-filter-form";
import { AudiencePreviewTable } from "../audience-preview-table";

interface StepAudienceProps {
    campaignUuid: string;
    channels: Channel[];
    value: CampaignFilters;
    onChange: (filters: CampaignFilters) => void;
}

export function StepAudience({
    campaignUuid,
    channels,
    value,
    onChange,
}: StepAudienceProps) {
    const preview = usePreviewCampaignContacts();
    const [result, setResult] = useState<PreviewContactsResult | null>(null);

    // De-bounced auto-preview when filters change
    const debounceTimer = useRef<number | null>(null);
    const serializedFilters = useMemo(() => JSON.stringify(value), [value]);

    useEffect(() => {
        if (debounceTimer.current !== null) {
            window.clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = window.setTimeout(async () => {
            try {
                const res = await preview.mutateAsync({
                    uuid: campaignUuid,
                    filters: value,
                });
                setResult(res);
            } catch {
                // toast surfaced by hook
            }
        }, 400);
        return () => {
            if (debounceTimer.current !== null) {
                window.clearTimeout(debounceTimer.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serializedFilters, campaignUuid]);

    const excluded = useMemo(
        () => new Set(value.exclude_uuids ?? []),
        [value.exclude_uuids],
    );

    const onToggleExclude = (uuid: string) => {
        const next = new Set(excluded);
        if (next.has(uuid)) next.delete(uuid);
        else next.add(uuid);
        onChange({
            ...value,
            exclude_uuids: Array.from(next),
        });
    };

    const includedCount = (result?.total ?? 0) - excluded.size;

    return (
        <div className="flex flex-col gap-6">
            <AudienceFilterForm
                value={value}
                onChange={(patch) => onChange({ ...value, ...patch })}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                    <Users className="size-5 text-accent" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            {preview.isPending && !result ? "…" : includedCount} contacts in audience
                        </div>
                        {result && (
                            <div className="text-xs text-muted">
                                {result.with_email} with email · {result.with_phone} with phone
                                {excluded.size > 0 && ` · ${excluded.size} excluded`}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onPress={async () => {
                        const res = await preview.mutateAsync({
                            uuid: campaignUuid,
                            filters: value,
                        });
                        setResult(res);
                    }}
                    isPending={preview.isPending}
                >
                    <RefreshCw className="size-3.5" />
                    Refresh
                </Button>
            </div>

            <AudiencePreviewTable
                rows={result?.sample ?? []}
                channels={channels}
                excluded={excluded}
                onToggleExclude={onToggleExclude}
            />
            {result && result.total > (result.sample?.length ?? 0) && (
                <p className="text-xs text-muted text-center">
                    Showing the first {result.sample.length} of {result.total} matched contacts.
                    All {result.total - excluded.size} included contacts will receive the campaign.
                </p>
            )}
        </div>
    );
}
