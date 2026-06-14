import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { RefreshCw, Users } from "lucide-react";
import type {
    CampaignFilters,
    PreviewContactsResult,
} from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { usePreviewCampaignContacts } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
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

    const handleChange = (patch: Partial<CampaignFilters>) => {
        onChange({ ...value, ...patch });
    };

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
        handleChange({ exclude_uuids: Array.from(next) });
    };

    const matchingCount = (result?.total ?? 0) - excluded.size;
    const sendableCount = useMemo(() => {
        if (!result) return matchingCount;
        let count = result.total;
        if (channels.includes(Channel.EMAIL)) count = Math.min(count, result.with_email);
        if (channels.includes(Channel.SMS)) count = Math.min(count, result.with_phone);
        return Math.max(0, count - excluded.size);
    }, [result, channels, excluded.size, matchingCount]);

    return (
        <div className="flex flex-col gap-6">
            <AudienceFilterForm
                value={value}
                onChange={handleChange}
                showContactListFilter
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                    <Users className="size-5 text-accent" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            {preview.isPending && !result ? "…" : matchingCount} contacts match filters
                        </div>
                        {result && (
                            <div className="text-xs text-muted">
                                {result.with_email} with email · {result.with_phone} with phone
                                {sendableCount !== matchingCount
                                    ? ` · ${sendableCount} sendable on selected channels`
                                    : null}
                                {excluded.size > 0 ? ` · ${excluded.size} excluded` : null}
                            </div>
                        )}
                    </div>
                </div>
                <ActionButtonWithPending
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
                    idleLeading={<RefreshCw className="size-3.5" />}
                >
                    Refresh
                </ActionButtonWithPending>
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
                    {sendableCount > 0
                        ? ` ${sendableCount} contact${sendableCount === 1 ? "" : "s"} can receive this campaign on the selected channels.`
                        : " None of the matched contacts have the required email or phone for the selected channels."}
                </p>
            )}
        </div>
    );
}
