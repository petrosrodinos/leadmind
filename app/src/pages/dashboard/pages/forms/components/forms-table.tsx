import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table } from "@heroui/react";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Routes } from "@/routes/routes";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteForm, useDuplicateForm } from "@/features/forms/hooks/use-forms";
import type { Form } from "@/features/forms/interfaces/form.interface";
import { FormFormModal } from "./form-form-modal";

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function RowActions({ form }: { form: Form }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const duplicate = useDuplicateForm();
    const del = useDeleteForm();
    const formHref = Routes.dashboard.forms_detail.replace(":uuid", form.uuid);

    return (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            <Link
                to={formHref}
                aria-label="Open form"
                className="inline-flex items-center justify-center size-8 rounded-md text-foreground hover:bg-surface-secondary transition-colors"
            >
                <ExternalLink className="size-3.5" />
            </Link>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setEditOpen(true)}
                aria-label="Edit form"
            >
                <Pencil className="size-3.5" />
            </Button>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => duplicate.mutate(form.uuid)}
                isDisabled={duplicate.isPending}
                aria-label="Duplicate form"
            >
                <Copy className="size-3.5" />
            </Button>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setDeleteOpen(true)}
                className="text-danger"
                aria-label="Delete form"
            >
                <Trash2 className="size-3.5" />
            </Button>

            <FormFormModal isOpen={editOpen} onOpenChange={setEditOpen} editing={form} />
            <ConfirmDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this form?"
                description="All fields and completions associated with this form will also be permanently deleted."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={del.isPending}
                onConfirm={() => del.mutate(form.uuid, { onSuccess: () => setDeleteOpen(false) })}
            />
        </div>
    );
}

const columnHelper = createColumnHelper<Form>();

interface FormsTableProps {
    forms: Form[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function FormsTable({
    forms,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
}: FormsTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                id: "name",
                header: "Name",
                cell: (info) => (
                    <span className="font-medium text-foreground">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("description", {
                id: "description",
                header: "Description",
                cell: (info) => {
                    const val = info.getValue();
                    return (
                        <span className="text-sm text-muted line-clamp-1 max-w-xs">
                            {val ?? "—"}
                        </span>
                    );
                },
            }),
            columnHelper.accessor((row) => row._count?.fields ?? 0, {
                id: "fields",
                header: "Fields",
                cell: (info) => (
                    <span className="text-sm text-muted">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor((row) => row._count?.completions ?? 0, {
                id: "completions",
                header: "Completions",
                cell: (info) => (
                    <span className="text-sm text-muted">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("created_at", {
                id: "created_at",
                header: "Created",
                cell: (info) => (
                    <span className="text-sm text-muted whitespace-nowrap">
                        {formatDate(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => <RowActions form={info.row.original} />,
            }),
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: forms,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label="Forms"
                        className="min-w-[700px]"
                    >
                        <Table.Header>
                            {table.getHeaderGroups()[0]!.headers.map((header) => (
                                <Table.Column
                                    key={header.id}
                                    id={header.id}
                                    isRowHeader={header.id === "name"}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </Table.Column>
                            ))}
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() =>
                                isLoading ? null : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted">
                                        <p className="text-sm">No forms found.</p>
                                        <p className="text-xs">
                                            Create your first form to get started.
                                        </p>
                                    </div>
                                )
                            }
                        >
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                      <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                                          {columns.map((c) => (
                                              <Table.Cell key={c.id}>
                                                  <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                                              </Table.Cell>
                                          ))}
                                      </Table.Row>
                                  ))
                                : table.getRowModel().rows.map((row) => {
                                      const rowHref = Routes.dashboard.forms_detail.replace(":uuid", row.id);
                                      const rowLabel = `View form ${row.original.name}`;

                                      return (
                                      <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                                          {row.getVisibleCells().map((cell) => {
                                              const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                                              const isInteractive = isTableNavInteractiveCell(cell.column.id);

                                              return (
                                              <Table.Cell
                                                  key={cell.id}
                                                  className={isInteractive ? tableNavInteractiveCellClassName : undefined}
                                              >
                                                  {renderTableNavCellContent(cell.column.id, rowHref, content, {
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
                    <TablePagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        isFetching={isFetching}
                        isLoading={isLoading}
                        label="forms"
                    />
                </Table.Footer>
            </Table>
        </div>
    );
}
