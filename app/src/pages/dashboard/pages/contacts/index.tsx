import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Tabs } from "@heroui/react";
import { Columns3, LayoutList, Plus } from "lucide-react";
import { ContactsTable } from "./components/contacts-table";
import { PipelineView } from "./components/pipeline-view";
import { NewContactModal } from "./components/new-contact-modal";
import { BulkScoreContactsPopover } from "./components/bulk-score-contacts-popover";
import { ContactFiltersForm } from "@/pages/dashboard/components/contact-filters-form";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
    contactFiltersToListQuery,
    parseContactFiltersFromSearchParams,
    serializeContactFiltersToSearchParams,
} from "@/lib/contact-filter-params";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import { Routes } from "@/routes/routes";

const TABLE_PAGE_SIZE = 20;
const PIPELINE_PAGE_SIZE = 100;
const VIEW_STORAGE_KEY = "contacts.view";

type View = "table" | "pipeline";

const isView = (v: string | null): v is View => v === "table" || v === "pipeline";

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
  const filters = useMemo(
    () => parseContactFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const updateFilters = (patch: Partial<ContactFilters>, resetPage = true) => {
    const next = { ...filters, ...patch };
    const serialized = serializeContactFiltersToSearchParams(next);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(serialized)) {
      if (value != null && value !== "") params.set(key, value);
    }
    if (resetPage) params.set("page", "1");
    else if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
    setSelectedKeys(new Set());
  };

  const debouncedFilters = useDebouncedValue(filters, 300);
  const pageSize = view === "pipeline" ? PIPELINE_PAGE_SIZE : TABLE_PAGE_SIZE;

  const query = useMemo(
    () =>
      contactFiltersToListQuery(debouncedFilters, {
        page: view === "pipeline" ? 1 : page,
        limit: pageSize,
      }),
    [debouncedFilters, view, page, pageSize],
  );

  const { data, isLoading, isFetching } = useContacts(query);

  const contacts = data?.data ?? [];

  const goToDetail = (uuid: string) => navigate(Routes.dashboard.contacts_detail.replace(":uuid", uuid));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
        <div className="flex items-center gap-2">
          {view === "table" ? (
            <BulkScoreContactsPopover selectedContactUuids={[...selectedKeys]} onScoringComplete={() => setSelectedKeys(new Set())} />
          ) : null}
          <Tabs selectedKey={view} onSelectionChange={(key) => setView(String(key) as View)}>
            <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
              <Tabs.Tab id="table" className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent inline-flex items-center gap-1.5">
                <LayoutList className="size-3.5" />
                Table
              </Tabs.Tab>
              <Tabs.Tab id="pipeline" className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent inline-flex items-center gap-1.5">
                <Columns3 className="size-3.5" />
                Pipeline
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <Button onPress={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add contact
          </Button>
        </div>
      </div>

      <ContactFiltersForm
        value={filters}
        onChange={(patch) => updateFilters(patch)}
        showLeadSourceType
        collapsible
        defaultOpen={false}
        sections={{ engagement: true, outreach: true }}
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
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", String(p));
            setSearchParams(params, { replace: true });
          }}
          onRowClick={(c) => goToDetail(c.uuid)}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
      ) : (
        <PipelineView contacts={contacts} isLoading={isLoading} onCardClick={(c) => goToDetail(c.uuid)} />
      )}

      <NewContactModal isOpen={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
