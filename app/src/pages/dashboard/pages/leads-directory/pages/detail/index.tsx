import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Dropdown, Input, Label, ListBox, Pagination, Select, Tabs } from "@heroui/react";
import { ArrowLeft, Check, MoreVertical, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import type { Lead } from "@/features/leads/interfaces/lead.interface";
import { EnrichmentSourceBadge } from "@/components/ui/enrichment-source-badge";
import { SourceBadge } from "@/components/ui/source-badge";
import { ENRICHMENT_SOURCE_OPTIONS, type EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import { useEnrichLead, useLeadEnrichments } from "@/features/lead-enrichment/hooks/use-lead-enrichment";
import { useLead, useDeleteLead } from "@/features/leads/hooks/use-leads";
import { useAddLeadToCrm } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Routes } from "@/routes/routes";
import { EnrichmentRunModal } from "@/components/ui/enrichment-action-popover";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/stores/auth";
import { RoleTypes } from "@/features/user/interfaces/user.interface";
import { LeadDirectoryProfileTab } from "./components/lead-directory-profile-tab";

const ENRICHMENT_PAGE_SIZE = 10;

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "enrichment", label: "Enrichment" },
] as const;

export default function LeadDirectoryDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, isError } = useLead(uuid);
  const enrich = useEnrichLead();
  const addToCrm = useAddLeadToCrm();
  const deleteLeadMu = useDeleteLead();
  const { role } = useAuthStore();
  const canAdminDelete = role === RoleTypes.ADMIN || role === RoleTypes.SUPER_ADMIN;
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [adopted, setAdopted] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!uuid) return;
    await deleteLeadMu.mutateAsync(uuid);
    setConfirmDeleteOpen(false);
    navigate(Routes.dashboard.leads_directory);
  };

  const handleAddToCrm = () => {
    if (!uuid) return;
    addToCrm.mutate(uuid, {
      onSuccess: () => setAdopted(true),
      onError: (error: any) => {
        if (error.status === 409) {
          setAdopted(true);
        }
      },
    });
  };

  if (!uuid) {
    return null;
  }

  if (isError || (!isLoading && !lead)) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="tertiary" onPress={() => navigate(Routes.dashboard.leads_directory)}>
          <ArrowLeft className="size-4" />
          Back to directory
        </Button>
        <p className="text-sm text-muted">Lead not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
        <div className="flex items-start gap-3 min-w-0">
          <Button size="sm" variant="tertiary" onPress={() => navigate(Routes.dashboard.leads_directory)} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            {isLoading ? <div className="h-7 w-48 max-w-full rounded-md bg-surface-secondary animate-pulse" /> : <h1 className="text-xl font-semibold text-foreground truncate">{lead?.name ?? "Lead"}</h1>}
            {lead && (
              <p className="text-sm text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <SourceBadge source={lead.source_type} className="shrink-0" />
                {lead.company ? <span className="truncate">· {lead.company}</span> : null}
              </p>
            )}
          </div>
        </div>
        {lead && (
          <>
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Lead actions"
                className="inline-flex items-center justify-center size-9 rounded-lg border border-border bg-surface hover:bg-surface-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
              >
                <MoreVertical className="size-4" />
              </Dropdown.Trigger>
              <Dropdown.Popover
                placement="bottom end"
                className="rounded-xl border border-border bg-surface p-1 shadow-xl outline-none backdrop-blur-none [backdrop-filter:none]"
              >
                <Dropdown.Menu
                  className="min-w-[11rem] bg-transparent p-0 outline-none backdrop-blur-none [backdrop-filter:none]"
                  onAction={(key) => {
                    if (key === "enrich") setEnrichModalOpen(true);
                    if (key === "add-crm") handleAddToCrm();
                    if (key === "delete") setConfirmDeleteOpen(true);
                  }}
                >
                  <Dropdown.Item id="enrich" textValue="Run enrichment" isDisabled={enrich.isPending}>
                    <span className="flex items-center gap-2.5 antialiased">
                      <Sparkles className="size-4 shrink-0 text-violet-500" strokeWidth={2} />
                      <span className="font-medium text-violet-400">Run enrichment</span>
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="add-crm" textValue={adopted ? "Added to CRM" : "Add to CRM"} isDisabled={adopted || addToCrm.isPending}>
                    {adopted ? (
                      <span className="flex items-center gap-2.5 antialiased">
                        <Check className="size-4 shrink-0 text-emerald-500" strokeWidth={2} />
                        <span className="font-medium text-emerald-400">Added to CRM</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5 antialiased">
                        <Plus className="size-4 shrink-0 text-emerald-500" strokeWidth={2} />
                        <span className="font-medium text-emerald-400">Add to CRM</span>
                      </span>
                    )}
                  </Dropdown.Item>
                  {canAdminDelete ? (
                    <Dropdown.Item id="delete" variant="danger" textValue="Delete lead" isDisabled={deleteLeadMu.isPending}>
                      <span className="flex items-center gap-2.5 antialiased">
                        <Trash2 className="size-4 shrink-0 text-red-500" strokeWidth={2} />
                        <span className="font-medium text-red-400">Delete lead</span>
                      </span>
                    </Dropdown.Item>
                  ) : null}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            <EnrichmentRunModal
              isOpen={enrichModalOpen}
              onOpenChange={setEnrichModalOpen}
              mode="lead"
              isPending={enrich.isPending}
              onEnrich={(sources) => enrich.mutate({ uuid: lead.uuid, sources })}
            />
          </>
        )}
      </div>

      {lead && canAdminDelete ? (
        <ConfirmDialog
          isOpen={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          title={`Delete lead "${lead.name ?? "this lead"}"?`}
          description="This permanently removes the public lead record, all enrichment history, and every CRM contact linked to it."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          isPending={deleteLeadMu.isPending}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
        <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <Tabs.Tab key={t.id} id={t.id} className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap">
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <div className="pt-2">
        {isLoading || !lead ? (
          <div className="max-w-5xl space-y-4 animate-pulse">
            <div className="h-48 rounded-2xl bg-surface-secondary" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-36 rounded-2xl bg-surface-secondary" />
              <div className="h-36 rounded-2xl bg-surface-secondary" />
              <div className="h-36 rounded-2xl bg-surface-secondary" />
              <div className="h-36 rounded-2xl bg-surface-secondary" />
            </div>
          </div>
        ) : activeTab === "profile" ? (
          <LeadDirectoryProfileTab lead={lead} />
        ) : (
          <EnrichmentTabContent leadUuid={uuid} lead={lead} />
        )}
      </div>
    </div>
  );
}

function EnrichmentTabContent({ leadUuid, lead }: { leadUuid: string; lead: Lead }) {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<EnrichmentSource | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

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

  const { data, isLoading, isFetching } = useLeadEnrichments(leadUuid, listQuery);
  const enrichments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const start = total === 0 ? 0 : (page - 1) * ENRICHMENT_PAGE_SIZE + 1;
  const end = Math.min(page * ENRICHMENT_PAGE_SIZE, total);
  const hasFilters = Boolean(sourceFilter || debouncedSearch.trim());

  return (
    <div className="space-y-6">
      <EnrichmentSnapshotPanel className="max-w-5xl" summary={lead.enrichment_summary} metadata={lead.enrichment_metadata} />

      <div>
        <p className="text-sm font-medium text-foreground mb-3">History</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end mb-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="enrichment-search" className="mb-1 block text-xs text-muted">
              Search
            </Label>
            <div className="relative">
              <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input id="enrichment-search" placeholder="Summary or URL…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
            </div>
          </div>
          <div className="w-full sm:w-52">
            <Select className="w-full" placeholder="All sources" value={sourceFilter ?? ""} onChange={(v) => setSourceFilter((v as EnrichmentSource) || null)}>
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
                  {ENRICHMENT_SOURCE_OPTIONS.map((opt) => (
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
          <p className="text-sm text-muted italic">{hasFilters ? "No enrichment runs match your filters." : "No enrichment runs recorded yet."}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {enrichments.map((row) => (
                <li key={row.uuid} className="rounded-lg border border-border bg-surface p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <EnrichmentSourceBadge source={row.source} className="shrink-0" />
                    <span className="text-xs text-muted">{new Date(row.created_at).toLocaleString()}</span>
                  </div>
                  {row.source_url ? (
                    <p className="text-xs text-muted break-all">
                      {/^https?:\/\//i.test(row.source_url) ? (
                        <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          {row.source_url}
                        </a>
                      ) : (
                        row.source_url
                      )}
                    </p>
                  ) : null}
                  {(row.cost_usd != null || row.input_tokens != null || row.output_tokens != null) && (
                    <p className="text-xs text-muted">
                      {row.cost_usd != null && <span>Cost: ${row.cost_usd.toFixed(6)} </span>}
                      {row.input_tokens != null && <span>· in: {row.input_tokens} </span>}
                      {row.output_tokens != null && <span>· out: {row.output_tokens}</span>}
                    </p>
                  )}
                  {row.summary?.trim() ? <p className="text-sm text-foreground whitespace-pre-wrap break-words">{row.summary}</p> : null}
                  {row.payload != null && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted hover:text-foreground">Payload</summary>
                      <pre className="mt-2 p-3 rounded-md bg-surface-secondary border border-border overflow-x-auto whitespace-pre-wrap break-words font-mono">{JSON.stringify(row.payload, null, 2)}</pre>
                    </details>
                  )}
                  {row.metadata != null && typeof row.metadata === "object" && Object.keys(row.metadata).length > 0 ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted hover:text-foreground">Metadata</summary>
                      <pre className="mt-2 p-3 rounded-md bg-surface-secondary border border-border overflow-x-auto whitespace-pre-wrap break-words font-mono">{JSON.stringify(row.metadata, null, 2)}</pre>
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
                      <Pagination.Previous isDisabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
                        <Pagination.PreviousIcon />
                        Prev
                      </Pagination.Previous>
                    </Pagination.Item>
                    <Pagination.Item>
                      <Pagination.Link isActive>{page}</Pagination.Link>
                    </Pagination.Item>
                    <Pagination.Item>
                      <Pagination.Next isDisabled={page >= totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
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
