import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs } from "@heroui/react";
import { Columns3, LayoutList } from "lucide-react";
import { ContactsTable } from "./components/contacts-table";
import { PipelineView } from "./components/pipeline-view";
import { NewContactModal } from "./components/new-contact-modal";
import { BulkScoreContactsPopover } from "./components/bulk-score-contacts-popover";
import { BulkSendMessageModal } from "@/pages/dashboard/components/bulk-send-message-modal";
import { BulkEnrichmentRunModal } from "@/components/ui/bulk-enrichment-run-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ContactsActionsDropdown } from "./components/contacts-actions-dropdown";
import { ContactsToolbar } from "./components/contacts-toolbar";
import {
    DEFAULT_ENRICHMENT_SOURCES,
    enrichmentSourceOptionsForBulk,
} from "@/features/enrichment/constants/enrichment-sources";
import { useEnrichContactsBulk } from "@/features/enrichment/hooks/use-enrichment";
import { ContactFiltersForm } from "@/pages/dashboard/components/contact-filters-form";
import { ContactStackViewerScope } from "@/pages/dashboard/components/contact-stack-viewer";
import {
  useContacts,
  useBulkScrapeContactEmails,
  useDeleteContactsBulk,
} from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  contactFiltersToListQuery,
  contactFiltersToBulkScrapePayload,
  hasActiveContactFilters,
  parseContactFiltersFromSearchParams,
  serializeContactFiltersToSearchParams,
} from "@/lib/contact-filter-params";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import { Routes } from "@/routes/routes";
import { useDashboardNavbarTitle } from "@/components/providers/dashboard-navbar-provider";

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
  const [scoreOpen, setScoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [enrichOpen, setEnrichOpen] = useState(false);
  const [scrapeConfirmOpen, setScrapeConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const enrichBulk = useEnrichContactsBulk();
  const scrapeEmailsBulk = useBulkScrapeContactEmails();
  const deleteContactsBulk = useDeleteContactsBulk();

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

  const hasFilterScope = hasActiveContactFilters(debouncedFilters);
  const canScrapeEmails = view === "table" && (selectedKeys.size > 0 || hasFilterScope);

  const handleScrapeEmails = async () => {
    if (selectedKeys.size > 0) {
      await scrapeEmailsBulk.mutateAsync({ contact_uuids: [...selectedKeys] });
      setSelectedKeys(new Set());
      setScrapeConfirmOpen(false);
      return;
    }
    if (hasFilterScope) {
      await scrapeEmailsBulk.mutateAsync({
        filters: contactFiltersToBulkScrapePayload(debouncedFilters),
      });
      setScrapeConfirmOpen(false);
    }
  };

  const scrapeConfirmDescription =
    selectedKeys.size > 0
      ? `We'll visit each selected contact's website to look for an email. Only contacts without an email but with a website are processed. Target: ${selectedKeys.size} selected contact${selectedKeys.size === 1 ? "" : "s"}.`
      : `We'll visit each matching contact's website to look for an email. Only contacts without an email but with a website are processed. Target: all contacts matching your current filters.`;

  const deleteConfirmDescription =
    selectedKeys.size === 1
      ? "This removes the contact from your CRM. The underlying lead record stays in the public directory."
      : `This removes ${selectedKeys.size} contacts from your CRM. Underlying lead records stay in the public directory.`;

  const handleDeleteSelected = async () => {
    if (selectedKeys.size === 0) return;
    await deleteContactsBulk.mutateAsync([...selectedKeys]);
    setSelectedKeys(new Set());
    setDeleteConfirmOpen(false);
  };

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
  const contactUuids = contacts.map((contact) => contact.uuid);
  const selectedContacts = useMemo(
    () => contacts.filter((c) => selectedKeys.has(c.uuid)),
    [contacts, selectedKeys],
  );
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params, { replace: true });
  };

  const goToDetail = (uuid: string) => navigate(Routes.dashboard.contacts_detail.replace(":uuid", uuid));

  useDashboardNavbarTitle("Contacts");

  const contactMeta = isLoading
    ? undefined
    : `${total} contact${total === 1 ? "" : "s"}`;

  return (
    <ContactStackViewerScope
      contactUuids={contactUuids}
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalCount={total}
      onPageChange={handlePageChange}
    >
      {(quickBrowse) => (
        <div className="space-y-4">
          <ContactsToolbar
            title="Contacts"
            meta={contactMeta}
            actions={
              <>
                <ContactsActionsDropdown
                  onAddContact={() => setCreateOpen(true)}
                  onQuickBrowse={view === "table" ? quickBrowse.openFirst : undefined}
                  quickBrowseDisabled={!quickBrowse.hasContacts}
                  onScoreSelected={view === "table" ? () => setScoreOpen(true) : undefined}
                  scoreDisabled={selectedKeys.size === 0}
                  onSendMessagesSelected={
                    view === "table" ? () => setComposeOpen(true) : undefined
                  }
                  sendMessagesDisabled={selectedKeys.size === 0}
                  onEnrichSelected={view === "table" ? () => setEnrichOpen(true) : undefined}
                  enrichDisabled={selectedKeys.size === 0 || enrichBulk.isPending}
                  onScrapeEmailsSelected={view === "table" ? () => setScrapeConfirmOpen(true) : undefined}
                  scrapeEmailsPending={scrapeEmailsBulk.isPending}
                  scrapeEmailsDisabled={!canScrapeEmails}
                  onDeleteSelected={view === "table" ? () => setDeleteConfirmOpen(true) : undefined}
                  deleteDisabled={selectedKeys.size === 0}
                  deletePending={deleteContactsBulk.isPending}
                />
                <Tabs selectedKey={view} onSelectionChange={(key) => setView(String(key) as View)}>
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
              </>
            }
          />

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
              total={total}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              onContactOpen={quickBrowse.openAt}
            />
          ) : (
            <PipelineView contacts={contacts} isLoading={isLoading} onCardClick={(c) => goToDetail(c.uuid)} />
          )}

          <NewContactModal isOpen={createOpen} onOpenChange={setCreateOpen} />
          {view === "table" ? (
            <BulkScoreContactsPopover
              isOpen={scoreOpen}
              onOpenChange={setScoreOpen}
              selectedContactUuids={[...selectedKeys]}
              onScoringComplete={() => setSelectedKeys(new Set())}
            />
          ) : null}
          {view === "table" ? (
            <BulkSendMessageModal
              isOpen={composeOpen}
              onOpenChange={setComposeOpen}
              contacts={selectedContacts}
              onComplete={() => setSelectedKeys(new Set())}
            />
          ) : null}
          {view === "table" ? (
            <BulkEnrichmentRunModal
              isOpen={enrichOpen}
              onOpenChange={setEnrichOpen}
              mode="contact"
              selectedCount={selectedKeys.size}
              sourceOptions={enrichmentSourceOptionsForBulk()}
              initialSources={DEFAULT_ENRICHMENT_SOURCES}
              isPending={enrichBulk.isPending}
              onEnrich={(sources) => {
                if (selectedKeys.size === 0) return;
                enrichBulk.mutate(
                  { uuids: [...selectedKeys], sources },
                  { onSuccess: () => setSelectedKeys(new Set()) },
                );
              }}
            />
          ) : null}
          {view === "table" ? (
            <ConfirmDialog
              isOpen={scrapeConfirmOpen}
              onOpenChange={setScrapeConfirmOpen}
              title="Find emails from websites?"
              description={scrapeConfirmDescription}
              confirmLabel="Start lookup"
              isPending={scrapeEmailsBulk.isPending}
              onConfirm={handleScrapeEmails}
            />
          ) : null}
          {view === "table" ? (
            <ConfirmDialog
              isOpen={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
              title={
                selectedKeys.size === 1
                  ? "Delete selected contact?"
                  : `Delete ${selectedKeys.size} selected contacts?`
              }
              description={deleteConfirmDescription}
              confirmLabel="Delete"
              cancelLabel="Cancel"
              variant="danger"
              isPending={deleteContactsBulk.isPending}
              onConfirm={handleDeleteSelected}
            />
          ) : null}
        </div>
      )}
    </ContactStackViewerScope>
  );
}
