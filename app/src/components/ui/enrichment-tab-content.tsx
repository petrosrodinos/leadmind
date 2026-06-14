import { useEffect, useMemo, useState } from "react";
import { Input, Label, ListBox, Pagination, Select } from "@heroui/react";
import { Search } from "lucide-react";
import { EnrichmentSourceBadge } from "@/components/ui/enrichment-source-badge";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import {
    enrichmentSourceOptionsForLead,
    type EnrichmentSource,
} from "@/features/enrichment/constants/enrichment-sources";
import { useEnrichments } from "@/features/enrichment/hooks/use-enrichment";
import type { EnrichmentEntityKind } from "@/features/enrichment/interfaces/enrichment.interfaces";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const ENRICHMENT_PAGE_SIZE = 10;

export type EnrichmentTabContentProps = {
    entityKind: EnrichmentEntityKind;
    entityUuid: string;
    summary: string | null | undefined;
    metadata: Record<string, unknown> | null | undefined;
    sourceType: SourceType;
};

export function EnrichmentTabContent({
    entityKind,
    entityUuid,
    summary,
    metadata,
    sourceType,
}: EnrichmentTabContentProps) {
    const [page, setPage] = useState(1);
    const [sourceFilter, setSourceFilter] = useState<EnrichmentSource | null>(null);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 300);
    const enrichmentSourceOptions = useMemo(
        () => enrichmentSourceOptionsForLead(sourceType),
        [sourceType],
    );

    const listQuery = useMemo(
        () => ({
            page,
            limit: ENRICHMENT_PAGE_SIZE,
            ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
            ...(sourceFilter ? { source: sourceFilter } : {}),
        }),
        [page, debouncedSearch, sourceFilter],
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, sourceFilter]);

    const { data, isLoading, isFetching } = useEnrichments(entityKind, entityUuid, listQuery);
    const enrichments = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, data?.totalPages ?? 1);
    const start = total === 0 ? 0 : (page - 1) * ENRICHMENT_PAGE_SIZE + 1;
    const end = Math.min(page * ENRICHMENT_PAGE_SIZE, total);
    const hasFilters = Boolean(sourceFilter || debouncedSearch.trim());

    return (
        <div className="space-y-6">
            <EnrichmentSnapshotPanel className="max-w-5xl" summary={summary} metadata={metadata} />

            <div>
                <p className="text-sm font-medium text-foreground mb-3">History</p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <Label htmlFor="enrichment-search" className="mb-1 block text-xs text-muted">
                            Search
                        </Label>
                        <div className="relative">
                            <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <Input
                                id="enrichment-search"
                                placeholder="Summary or URL…"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                fullWidth
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-52">
                        <Select
                            className="w-full"
                            placeholder="All sources"
                            value={sourceFilter ?? ""}
                            onChange={(v) => setSourceFilter((v as EnrichmentSource) || null)}
                        >
                            <Label className="text-xs text-muted">Source</Label>
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    <ListBox.Item id="" textValue="All sources">
                                        All sources
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    {enrichmentSourceOptions.map((opt) => (
                                        <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                            {opt.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-lg bg-surface-secondary animate-pulse" />
                        ))}
                    </div>
                ) : enrichments.length === 0 ? (
                    <p className="text-sm text-muted italic">
                        {hasFilters
                            ? "No enrichment runs match your filters."
                            : "No enrichment runs recorded yet."}
                    </p>
                ) : (
                    <>
                        <ul className="flex flex-col gap-4">
                            {enrichments.map((row) => (
                                <li key={row.uuid} className="rounded-lg border border-border bg-surface p-4 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <EnrichmentSourceBadge source={row.source} className="shrink-0" />
                                        <span className="text-xs text-muted">
                                            {new Date(row.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {row.source_url ? (
                                        <p className="text-xs text-muted break-all">
                                            {/^https?:\/\//i.test(row.source_url) ? (
                                                <a
                                                    href={row.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-accent hover:underline"
                                                >
                                                    {row.source_url}
                                                </a>
                                            ) : (
                                                row.source_url
                                            )}
                                        </p>
                                    ) : null}
                                    {(row.cost_usd != null ||
                                        row.input_tokens != null ||
                                        row.output_tokens != null) && (
                                        <p className="text-xs text-muted">
                                            {row.cost_usd != null && (
                                                <span>Cost: ${row.cost_usd.toFixed(6)} </span>
                                            )}
                                            {row.input_tokens != null && <span>· in: {row.input_tokens} </span>}
                                            {row.output_tokens != null && (
                                                <span>· out: {row.output_tokens}</span>
                                            )}
                                        </p>
                                    )}
                                    {row.summary?.trim() ? (
                                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                            {row.summary}
                                        </p>
                                    ) : null}
                                    {row.payload != null && (
                                        <details className="text-xs">
                                            <summary className="cursor-pointer text-muted hover:text-foreground">
                                                Payload
                                            </summary>
                                            <pre className="mt-2 p-3 rounded-md bg-surface-secondary border border-border overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                                {JSON.stringify(row.payload, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                    {row.metadata != null &&
                                    typeof row.metadata === "object" &&
                                    Object.keys(row.metadata).length > 0 ? (
                                        <details className="text-xs">
                                            <summary className="cursor-pointer text-muted hover:text-foreground">
                                                Metadata
                                            </summary>
                                            <pre className="mt-2 p-3 rounded-md bg-surface-secondary border border-border overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                                {JSON.stringify(row.metadata, null, 2)}
                                            </pre>
                                        </details>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                        {total > ENRICHMENT_PAGE_SIZE && (
                            <div className="mt-4 flex justify-center">
                                <Pagination size="sm">
                                    <Pagination.Summary>
                                        {start} to {end} of {total}
                                        {isFetching && !isLoading ? " · refreshing…" : ""}
                                    </Pagination.Summary>
                                    <Pagination.Content>
                                        <Pagination.Item>
                                            <Pagination.Previous
                                                isDisabled={page <= 1}
                                                onPress={() => setPage((p) => Math.max(1, p - 1))}
                                            >
                                                <Pagination.PreviousIcon />
                                                Prev
                                            </Pagination.Previous>
                                        </Pagination.Item>
                                        <Pagination.Item>
                                            <Pagination.Link isActive>{page}</Pagination.Link>
                                        </Pagination.Item>
                                        <Pagination.Item>
                                            <Pagination.Next
                                                isDisabled={page >= totalPages}
                                                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            >
                                                Next
                                                <Pagination.NextIcon />
                                            </Pagination.Next>
                                        </Pagination.Item>
                                    </Pagination.Content>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
