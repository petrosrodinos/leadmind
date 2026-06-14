import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Dropdown, Tabs } from "@heroui/react";
import { ArrowLeft, Check, MoreVertical, Plus, Sparkles, Trash2 } from "lucide-react";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { SourceBadge } from "@/components/ui/source-badge";
import {
  defaultEnrichmentSourcesForLead,
  enrichmentSourceOptionsForLead,
} from "@/features/enrichment/constants/enrichment-sources";
import { useEnrichLead } from "@/features/enrichment/hooks/use-enrichment";
import { EnrichmentTabContent } from "@/components/ui/enrichment-tab-content";
import { useLead, useDeleteLead } from "@/features/leads/hooks/use-leads";
import { useAddLeadToCrm } from "@/features/contacts/hooks/use-contacts";
import { Routes } from "@/routes/routes";
import { EnrichmentRunModal } from "@/components/ui/enrichment-action-popover";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePermission } from "@/hooks/use-permission";
import { LeadDirectoryProfileTab } from "./components/lead-directory-profile-tab";

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
  const canDeleteLead = usePermission("lead_delete");
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [adopted, setAdopted] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);

  const enrichmentSourceOptions = useMemo(
    () => enrichmentSourceOptionsForLead(lead?.source_type),
    [lead?.source_type],
  );

  const defaultEnrichmentSources = useMemo(
    () => defaultEnrichmentSourcesForLead(lead?.source_type),
    [lead?.source_type],
  );

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
                  {canDeleteLead ? (
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
              sourceOptions={enrichmentSourceOptions}
              initialSources={defaultEnrichmentSources}
              isPending={enrich.isPending}
              contextHint={
                lead.source_type === SourceType.GEMI
                  ? "Uses registry data on file, fetches public GEMI documents, then runs with your other selected sources."
                  : undefined
              }
              onEnrich={(sources, options) =>
                enrich.mutate({ uuid: lead.uuid, sources, use_batch: options?.use_batch })
              }
            />
          </>
        )}
      </div>

      {lead && canDeleteLead ? (
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
          <EnrichmentTabContent
            entityKind="lead"
            entityUuid={uuid}
            summary={lead.enrichment_summary}
            metadata={lead.enrichment_metadata}
            sourceType={lead.source_type}
          />
        )}
      </div>
    </div>
  );
}
