import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Tabs } from "@heroui/react";
import { Columns3, LayoutList, Plus } from "lucide-react";
import { ContactsTable } from "./components/contacts-table";
import { PipelineView } from "./components/pipeline-view";
import { NewContactModal } from "./components/new-contact-modal";
import { LeadFilters } from "@/pages/dashboard/pages/leads/components/lead-filters";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Routes } from "@/routes/routes";

const TABLE_PAGE_SIZE = 20;
const PIPELINE_PAGE_SIZE = 100;
const VIEW_STORAGE_KEY = "contacts.view";

type View = "table" | "pipeline";

const isView = (v: string | null): v is View => v === "table" || v === "pipeline";
const isLeadStatus = (s: string | null): s is LeadStatus =>
    !!s && (Object.values(LeadStatus) as string[]).includes(s);
const isSourceType = (s: string | null): s is SourceType =>
    !!s && (Object.values(SourceType) as string[]).includes(s);

export default function ContactsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [view, setView] = useState<View>(() => {
        if (typeof window === "undefined") return "table";
        const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
        return isView(stored) ? stored : "table";
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    }, [view]);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const statusParam = searchParams.get("status");
    const sourceParam = searchParams.get("source_type");
    const filterUuid = searchParams.get("filter_uuid") || undefined;
    const minScore = Math.max(1, Math.min(10, Number(searchParams.get("min_score") ?? 1)));
    const tags = (searchParams.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const status = isLeadStatus(statusParam) ? statusParam : undefined;
    const sourceType = isSourceType(sourceParam) ? sourceParam : undefined;

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const debouncedSearch = useDebouncedValue(search, 300);

    const pageSize = view === "pipeline" ? PIPELINE_PAGE_SIZE : TABLE_PAGE_SIZE;

    const query = useMemo(
        () => ({
            page: view === "pipeline" ? 1 : page,
            limit: pageSize,
            search: debouncedSearch || undefined,
            status,
            source_type: sourceType,
            filter_uuid: filterUuid,
            min_score: minScore > 1 ? minScore : undefined,
            tags: tags.length > 0 ? tags : undefined,
        }),
        [view, page, pageSize, debouncedSearch, status, sourceType, filterUuid, minScore, tags.join(",")],
    );

    const { data, isLoading, isFetching } = useContacts(query);

    const contacts = data?.data ?? [];

    const availableTags = useMemo(() => {
        const set = new Set<string>();
        contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
        return Array.from(set).sort();
    }, [contacts]);

    const goToDetail = (uuid: string) =>
        navigate(Routes.dashboard.contacts_detail.replace(":uuid", uuid));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
                <div className="flex items-center gap-2">
                    <Tabs
                        selectedKey={view}
                        onSelectionChange={(key) => setView(String(key) as View)}
                    >
                        <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
                            <Tabs.Tab
                                id="table"
                                className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent inline-flex items-center gap-1.5"
                            >
                                <LayoutList className="size-3.5" />
                                Table
                            </Tabs.Tab>
                            <Tabs.Tab
                                id="pipeline"
                                className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent inline-flex items-center gap-1.5"
                            >
                                <Columns3 className="size-3.5" />
                                Pipeline
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                    <Button onPress={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Add lead
                    </Button>
                </div>
            </div>

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
                filterUuid={filterUuid}
                onFilterUuidChange={(u) => updateParams({ filter_uuid: u, page: "1" })}
                tags={tags}
                onTagsChange={(next) =>
                    updateParams({
                        tags: next.length > 0 ? next.join(",") : undefined,
                        page: "1",
                    })
                }
                availableTags={availableTags}
            />

            {view === "table" ? (
                <ContactsTable
                    contacts={contacts}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    page={page}
                    pageSize={pageSize}
                    total={data?.total ?? 0}
                    totalPages={data?.totalPages ?? 1}
                    onPageChange={(p) => updateParams({ page: String(p) })}
                    onRowClick={(c) => goToDetail(c.uuid)}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                />
            ) : (
                <PipelineView
                    contacts={contacts}
                    isLoading={isLoading}
                    onCardClick={(c) => goToDetail(c.uuid)}
                />
            )}

            <NewContactModal isOpen={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
