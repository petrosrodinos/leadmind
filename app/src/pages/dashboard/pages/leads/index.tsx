import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LeadsTable } from "./components/leads-table";
import { LeadFilters } from "./components/lead-filters";
import { LeadDrawer } from "./components/lead-drawer";
import {
    LeadStatus,
    type Contact,
} from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 20;

const isLeadStatus = (s: string | null): s is LeadStatus =>
    !!s && (Object.values(LeadStatus) as string[]).includes(s);

const isSourceType = (s: string | null): s is SourceType =>
    !!s && (Object.values(SourceType) as string[]).includes(s);

export default function LeadsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const statusParam = searchParams.get("status");
    const sourceParam = searchParams.get("source_type");
    const minScore = Math.max(1, Math.min(10, Number(searchParams.get("min_score") ?? 1)));
    const tags = (searchParams.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const status = isLeadStatus(statusParam) ? statusParam : undefined;
    const sourceType = isSourceType(sourceParam) ? sourceParam : undefined;

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [drawerContact, setDrawerContact] = useState<Contact | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const debouncedSearch = useDebouncedValue(search, 300);

    const query = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            status,
            source_type: sourceType,
            min_score: minScore > 1 ? minScore : undefined,
            tags: tags.length > 0 ? tags : undefined,
        }),
        [page, debouncedSearch, status, sourceType, minScore, tags.join(",")],
    );

    const { data, isLoading, isFetching } = useContacts(query);

    const contacts = data?.data ?? [];

    const availableTags = useMemo(() => {
        const set = new Set<string>();
        contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
        return Array.from(set).sort();
    }, [contacts]);

    // Keep drawer contact fresh when list refetches.
    useEffect(() => {
        if (!drawerContact) return;
        const updated = contacts.find((c) => c.uuid === drawerContact.uuid);
        if (updated) setDrawerContact(updated);
    }, [contacts]);

    return (
        <div className="space-y-4">
            <LeadFilters
                search={search}
                onSearchChange={(s) => updateParams({ search: s, page: "1" })}
                status={status}
                onStatusChange={(s) => updateParams({ status: s, page: "1" })}
                minScore={minScore}
                onMinScoreChange={(n) =>
                    updateParams({ min_score: n > 1 ? String(n) : undefined, page: "1" })
                }
                sourceType={sourceType}
                onSourceTypeChange={(s) => updateParams({ source_type: s, page: "1" })}
                tags={tags}
                onTagsChange={(next) =>
                    updateParams({
                        tags: next.length > 0 ? next.join(",") : undefined,
                        page: "1",
                    })
                }
                availableTags={availableTags}
            />

            <LeadsTable
                contacts={contacts}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={data?.total ?? 0}
                totalPages={data?.totalPages ?? 1}
                onPageChange={(p) => updateParams({ page: String(p) })}
                onRowClick={(c) => {
                    setDrawerContact(c);
                    setDrawerOpen(true);
                }}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <LeadDrawer
                contactUuid={drawerOpen ? drawerContact?.uuid ?? null : null}
                isOpen={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) setDrawerContact(null);
                }}
            />
        </div>
    );
}
