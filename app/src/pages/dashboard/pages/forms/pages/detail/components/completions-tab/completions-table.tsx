import { useMemo, useState } from "react";
import { Button, Table } from "@heroui/react";
import { Eye, Trash2 } from "lucide-react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteFormCompletion } from "@/features/forms/hooks/use-form-completions";
import type { FormCompletion } from "@/features/forms/interfaces/form-completion.interface";
import type { FormField } from "@/features/forms/interfaces/form.interface";
import { Routes } from "@/routes/routes";
import { CompletionViewModal } from "./completion-view-modal";

function formatDate(d: string) {
    return new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function RowActions({
    formUuid,
    completion,
    fields,
}: {
    formUuid: string;
    completion: FormCompletion;
    fields: FormField[];
}) {
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const del = useDeleteFormCompletion(formUuid);

    return (
        <div
            className="flex items-center gap-1 justify-end"
            onClick={(e) => e.stopPropagation()}
        >
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setViewOpen(true)}
                aria-label="View completion"
            >
                <Eye className="size-3.5" />
            </Button>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setDeleteOpen(true)}
                className="text-danger"
                aria-label="Delete completion"
            >
                <Trash2 className="size-3.5" />
            </Button>

            <CompletionViewModal
                formUuid={formUuid}
                completion={completion}
                fields={fields}
                isOpen={viewOpen}
                onOpenChange={setViewOpen}
            />
            <ConfirmDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this completion?"
                description="All submitted values for this completion will be permanently deleted."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={del.isPending}
                onConfirm={() =>
                    del.mutate(completion.uuid, { onSuccess: () => setDeleteOpen(false) })
                }
            />
        </div>
    );
}

const columnHelper = createColumnHelper<FormCompletion>();

interface CompletionsTableProps {
    formUuid: string;
    completions: FormCompletion[];
    fields: FormField[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function CompletionsTable({
    formUuid,
    completions,
    fields,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
}: CompletionsTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor("contact", {
                id: "contact",
                header: "Contact",
                cell: (info) => {
                    const c = info.getValue();
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {c.name ?? c.email ?? "—"}
                            </span>
                            {c.company && (
                                <span className="text-xs text-muted">{c.company}</span>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor((row) => row.values.length, {
                id: "fields_filled",
                header: "Fields Filled",
                cell: (info) => (
                    <span className="text-sm text-muted">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("created_at", {
                id: "completed_at",
                header: "Completed At",
                cell: (info) => (
                    <span className="text-sm text-muted whitespace-nowrap">
                        {formatDate(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.accessor("updated_at", {
                id: "updated_at",
                header: "Last Updated",
                cell: (info) => (
                    <span className="text-sm text-muted whitespace-nowrap">
                        {formatDate(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => (
                    <RowActions
                        formUuid={formUuid}
                        completion={info.row.original}
                        fields={fields}
                    />
                ),
            }),
        ],
        [formUuid, fields],
    );

    const table = useReactTable({
        columns,
        data: completions,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Completions" className="min-w-[600px]">
                        <Table.Header>
                            {table.getHeaderGroups()[0]!.headers.map((header) => (
                                <Table.Column
                                    key={header.id}
                                    id={header.id}
                                    isRowHeader={header.id === "contact"}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </Table.Column>
                            ))}
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() =>
                                isLoading ? null : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted">
                                        <p className="text-sm">No completions yet.</p>
                                        <p className="text-xs">
                                            Record a completion to get started.
                                        </p>
                                    </div>
                                )
                            }
                        >
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                                          {columns.map((c) => (
                                              <Table.Cell key={c.id}>
                                                  <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                                              </Table.Cell>
                                          ))}
                                      </Table.Row>
                                  ))
                                : table.getRowModel().rows.map((row) => {
                                      const rowHref = Routes.dashboard.contacts_detail.replace(":uuid", row.original.contact_uuid);
                                      const rowLabel = `View contact ${row.original.contact.name ?? row.original.contact.email ?? "details"}`;

                                      return (
                                      <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                                          {row.getVisibleCells().map((cell) => {
                                              const content = flexRender(
                                                  cell.column.columnDef.cell,
                                                  cell.getContext(),
                                              );
                                              const isInteractive = isTableNavInteractiveCell(cell.column.id);

                                              return (
                                              <Table.Cell
                                                  key={cell.id}
                                                  className={isInteractive ? tableNavInteractiveCellClassName : undefined}
                                              >
                                                  {renderTableNavCellContent(cell.column.id, rowHref, content, {
                                                      primaryColumnId: "contact",
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
                    <TablePagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        isFetching={isFetching}
                        isLoading={isLoading}
                        label="completions"
                    />
                </Table.Footer>
            </Table>
        </div>
    );
}
