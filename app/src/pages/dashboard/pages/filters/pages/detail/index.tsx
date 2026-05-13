import { useState, type Key } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Chip, Dropdown, Tabs } from "@heroui/react";
import { ArrowLeft, MoreVertical, Pause, Play, Trash } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceBadge } from "@/components/ui/source-badge";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import { useDeleteFilter, useFilter, useLatestFilterJob, useRunFilter, useUpdateFilter } from "@/features/filters/hooks/use-filters";
import { FilterDetailTabIds, Routes } from "@/routes/routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterRunLeadingVisual } from "@/pages/dashboard/pages/filters/components/filter-run-controls";
import { useAuthStore } from "@/stores/auth";
import { RoleTypes } from "@/features/user/interfaces/user.interface";
import FilterContactsPage from "@/pages/dashboard/pages/filters/pages/contacts";
import { FilterEditPanel } from "@/pages/dashboard/pages/filters/pages/edit";
import FilterJobsPage from "@/pages/dashboard/pages/filters/pages/jobs";

const CHANNEL_LABEL: Record<Channel, string> = {
  [Channel.EMAIL]: "Email",
  [Channel.SMS]: "SMS",
  [Channel.LINKEDIN]: "LinkedIn",
};

export default function FilterDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: filter, isLoading } = useFilter(uuid);
  const updateFilter = useUpdateFilter();
  const runFilter = useRunFilter();
  const deleteFilter = useDeleteFilter();
  const { isActive: isJobActive } = useLatestFilterJob(uuid);
  const { role } = useAuthStore();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAdmin = role === RoleTypes.ADMIN || role === RoleTypes.SUPER_ADMIN;

  const TABS: Array<{ id: string; label: string }> = [{ id: FilterDetailTabIds.FILTER, label: "Filter" }, { id: FilterDetailTabIds.CONTACTS, label: "Contacts" }, ...(isAdmin ? [{ id: FilterDetailTabIds.JOBS, label: "Jobs" }] : [])];

  const allowedTabIds = new Set(TABS.map((t) => t.id));
  const rawTab = searchParams.get(Routes.dashboard.filters_detail_tab_query);
  const currentTab = rawTab && allowedTabIds.has(rawTab) ? rawTab : FilterDetailTabIds.FILTER;

  const isManual = filter?.source_type === SourceType.MANUAL;
  const runStarting = runFilter.isPending && !isJobActive;
  const runJobRunning = isJobActive;
  const runBusy = runFilter.isPending || isJobActive;

  const runDisabled = !filter || runBusy || isManual || !filter.enabled;
  const toggleDisabled = !filter || updateFilter.isPending;

  const handleAction = (key: Key) => {
    if (!filter) return;
    switch (key) {
      case "run":
        if (!runDisabled) runFilter.mutate(filter.uuid);
        break;
      case "toggle":
        if (!toggleDisabled) {
          updateFilter.mutate({
            uuid: filter.uuid,
            payload: { enabled: !filter.enabled },
          });
        }
        break;
      case "delete":
        setConfirmDeleteOpen(true);
        break;
    }
  };

  const handleConfirmDelete = async () => {
    if (!filter) return;
    await deleteFilter.mutateAsync(filter.uuid);
    setConfirmDeleteOpen(false);
    navigate(Routes.dashboard.filters);
  };

  const handleTabChange = (key: Key) => {
    if (!uuid) return;
    const next = new URLSearchParams();
    next.set(Routes.dashboard.filters_detail_tab_query, String(key));
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <Button size="sm" variant="tertiary" onPress={() => navigate(Routes.dashboard.filters)} aria-label="Back to filters">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">{isLoading ? "Loading…" : (filter?.name ?? "Filter not found")}</h1>
            {filter && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <SourceBadge source={filter.source_type} />
                {filter.channels.map((c) => (
                  <Chip key={c} size="sm" variant="soft" color="accent">
                    <Chip.Label>{CHANNEL_LABEL[c]}</Chip.Label>
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>

        {filter && (
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="soft" color={filter.enabled ? "success" : "default"}>
              <Chip.Label>{filter.enabled ? "Enabled" : "Disabled"}</Chip.Label>
            </Chip>
            <Dropdown>
              <Dropdown.Trigger aria-label="Filter actions" className="inline-flex items-center justify-center size-9 rounded-lg border border-border bg-surface hover:bg-surface-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <MoreVertical className="size-4" />
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu onAction={handleAction}>
                  <Dropdown.Item id="run" isDisabled={runDisabled} textValue={runBusy ? (runStarting ? "Starting filter run" : "Filter run in progress") : "Run now"}>
                    <span className="flex items-center gap-2">
                      <FilterRunLeadingVisual isStarting={runStarting} isJobRunning={runJobRunning} iconClassName="size-4" />
                      {runBusy ? (runStarting ? "Starting…" : "Running…") : "Run now"}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item id="toggle" isDisabled={toggleDisabled} textValue={filter.enabled ? "Disable" : "Enable"}>
                    {filter.enabled ? (
                      <>
                        <Pause className="size-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Enable
                      </>
                    )}
                  </Dropdown.Item>
                  <Dropdown.Item id="delete" variant="danger" textValue="Delete">
                    <Trash className="size-4" />
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        )}
      </div>

      <Tabs selectedKey={currentTab} onSelectionChange={handleTabChange}>
        <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
          {TABS.map((t) => (
            <Tabs.Tab key={t.id} id={t.id} className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <div className="pt-2">
        {currentTab === FilterDetailTabIds.FILTER && uuid && (
          <FilterEditPanel
            onCancel={() => {
              const next = new URLSearchParams();
              next.set(Routes.dashboard.filters_detail_tab_query, FilterDetailTabIds.CONTACTS);
              setSearchParams(next, { replace: true });
            }}
          />
        )}
        {currentTab === FilterDetailTabIds.CONTACTS && uuid && <FilterContactsPage />}
        {currentTab === FilterDetailTabIds.JOBS && uuid && <FilterJobsPage />}
      </div>

      {filter && <ConfirmDialog isOpen={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen} title={`Delete filter "${filter.name}"?`} description="This will permanently delete the filter and unschedule any future runs. Contacts already created from this filter are kept." confirmLabel="Delete" cancelLabel="Cancel" variant="danger" isPending={deleteFilter.isPending} onConfirm={handleConfirmDelete} />}
    </div>
  );
}
