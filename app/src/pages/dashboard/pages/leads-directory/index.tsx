import { useEffect, useMemo, useState } from "react";
import type { Selection } from "@heroui/react";
import { Button, Checkbox, Input, Label, ListBox, Select, Table } from "@heroui/react";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Check, Plus, Search, Sparkles } from "lucide-react";
import type { Lead, SourceType } from "@/features/leads/interfaces/lead.interface";
import { SOURCE_OPTIONS } from "@/features/filters/constants/source-options";
import { SourceBadge } from "@/components/ui/source-badge";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useAddLeadToCrm } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Routes } from "@/routes/routes";
import { usePermission } from "@/hooks/use-permission";
import { EnrichmentRunModal } from "@/components/ui/enrichment-action-popover";
import { useEnrichLeadsBulk } from "@/features/lead-enrichment/hooks/use-lead-enrichment";

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<Lead>();

export default function LeadsDirectoryPage() {
  const canBulkEnrich = usePermission("lead_enrichment_bulk");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sourceType, setSourceType] = useState<SourceType | undefined>(undefined);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [enrichModalOpen, setEnrichModalOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      source_type: sourceType,
    }),
    [page, debouncedSearch, sourceType],
  );

  useEffect(() => {
    setSelectedKeys(new Set());
  }, [page, debouncedSearch, sourceType]);

  const { data, isLoading, isFetching } = useLeads(query);
  const addToCrm = useAddLeadToCrm();
  const enrichBulk = useEnrichLeadsBulk();

  const [adoptedUuids, setAdoptedUuids] = useState<Set<string>>(new Set());

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-medium text-foreground">{info.getValue() ?? "—"}</span>,
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("source_type", {
        header: "Source",
        cell: (info) => <SourceBadge source={info.getValue()} />,
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const lead = info.row.original;
          const adopted = adoptedUuids.has(lead.uuid);
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
              <Button
                size="sm"
                variant={adopted ? "tertiary" : "secondary"}
                isDisabled={adopted || addToCrm.isPending}
                onPress={() => {
                  addToCrm.mutate(lead.uuid, {
                    onSuccess: () => {
                      setAdoptedUuids((prev) => new Set(prev).add(lead.uuid));
                    },
                    onError: (error: any) => {
                      if (error.status === 409) {
                        setAdoptedUuids((prev) => new Set(prev).add(lead.uuid));
                      }
                    },
                  });
                }}
              >
                {adopted ? (
                  <>
                    <Check className="size-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Add to CRM
                  </>
                )}
              </Button>
            </div>
          );
        },
      }),
    ],
    [adoptedUuids, addToCrm],
  );

  const rows = data?.data ?? [];

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.uuid,
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      setSelectedKeys(new Set(rows.map((r) => r.uuid)));
    } else {
      setSelectedKeys(new Set(Array.from(keys, String)));
    }
  };

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const selectedCount = selectedKeys.size;
  const bulkContextHint =
    selectedCount > 0 ? `One job per selected lead (${selectedCount}). Same sources for all.` : undefined;

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 min-w-0">
          <Label htmlFor="leads-search" className="mb-1 block">
            Search
          </Label>
          <div className="relative">
            <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              id="leads-search"
              placeholder="Name, company, email…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              fullWidth
            />
          </div>
        </div>
        <div className="w-full sm:w-56">
          <Select
            className="w-full"
            placeholder="All sources"
            value={sourceType ?? null}
            onChange={(v) => {
              setPage(1);
              setSourceType((v as SourceType) || undefined);
            }}
          >
            <Label>Source</Label>
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
                {SOURCE_OPTIONS.map((opt) => (
                  <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                    {opt.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        {canBulkEnrich ? (
          <div className="w-full sm:w-auto sm:ms-auto shrink-0">
            <Label className="mb-1 block opacity-0 pointer-events-none select-none" aria-hidden>
              Enrich
            </Label>
            <Button
              size="md"
              variant="secondary"
              isDisabled={selectedCount === 0 || enrichBulk.isPending}
              onPress={() => setEnrichModalOpen(true)}
            >
              <Sparkles className="size-4" />
              Enrich selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
          </div>
        ) : null}
      </div>

                {canBulkEnrich ? (
        <EnrichmentRunModal
          isOpen={enrichModalOpen}
          onOpenChange={setEnrichModalOpen}
          mode="lead"
          isPending={enrichBulk.isPending}
          contextHint={bulkContextHint}
          onEnrich={(sources, options) => {
            if (selectedKeys.size === 0) return;
            enrichBulk.mutate(
              { uuids: [...selectedKeys], sources, use_batch: options?.use_batch },
              {
                onSuccess: () => {
                  setSelectedKeys(new Set());
                },
              },
            );
          }}
        />
      ) : null}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Public leads directory"
              className={canBulkEnrich ? "min-w-[960px]" : "min-w-[900px]"}
              {...(canBulkEnrich
                ? {
                    selectionMode: "multiple" as const,
                    selectionBehavior: "toggle" as const,
                    selectedKeys,
                    onSelectionChange: handleSelectionChange,
                  }
                : {})}
            >
              <Table.Header>
                {canBulkEnrich ? (
                  <Table.Column className="pr-0 w-10">
                    <Checkbox aria-label="Select all on this page" slot="selection">
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>
                  </Table.Column>
                ) : null}
                {table.getHeaderGroups()[0]!.headers.map((header) => (
                  <Table.Column key={header.id} id={header.id} isRowHeader={header.id === "name"}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Column>
                ))}
              </Table.Header>
              <Table.Body renderEmptyState={() => (isLoading ? null : <div className="flex items-center justify-center py-12 text-center text-sm text-muted">No leads match your filters.</div>)}>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                        {canBulkEnrich ? (
                          <Table.Cell className="pr-0">
                            <div className="h-4 w-4 rounded bg-surface-secondary animate-pulse" />
                          </Table.Cell>
                        ) : null}
                        {columns.map((c) => (
                          <Table.Cell key={c.id}>
                            <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  : table.getRowModel().rows.map((row) => {
                      const rowHref = Routes.dashboard.leads_directory_detail.replace(":uuid", row.id);
                      const rowLabel = `View lead ${row.original.name ?? row.original.company ?? "details"}`;

                      return (
                      <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                        {canBulkEnrich ? (
                          <Table.Cell className={`pr-0 ${tableNavInteractiveCellClassName}`}>
                            <Checkbox aria-label={`Select ${row.original.name ?? "lead"}`} slot="selection">
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox>
                          </Table.Cell>
                        ) : null}
                        {row.getVisibleCells().map((cell) => {
                          const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                          const isInteractive = isTableNavInteractiveCell(cell.column.id, ["actions"]);

                          return (
                          <Table.Cell
                            key={cell.id}
                            className={isInteractive ? tableNavInteractiveCellClassName : undefined}
                          >
                            {renderTableNavCellContent(cell.column.id, rowHref, content, {
                              interactiveColumnIds: ["actions"],
                              primaryColumnId: "name",
                              ariaLabel: rowLabel,
                            })}
                          </Table.Cell>
                          );
                        })}
                      </Table.Row>
                      );
                    })}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <TablePagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} isFetching={isFetching} isLoading={isLoading} label="results" />
          </Table.Footer>
        </Table>
      </div>
    </div>
  );
}
