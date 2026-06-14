import { useMemo, useState } from "react";
import { Button, Table } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Routes } from "@/routes/routes";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteContactList } from "@/features/contact-lists/hooks/use-contact-lists";
import type { ContactList } from "@/features/contact-lists/interfaces/contact-list.interface";
import { ContactListFormModal } from "./contact-list-form-modal";

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function RowActions({ list }: { list: ContactList }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const del = useDeleteContactList();

    return (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setEditOpen(true)}
                aria-label="Edit list"
            >
                <Pencil className="size-3.5" />
            </Button>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setDeleteOpen(true)}
                className="text-danger"
                aria-label="Delete list"
            >
                <Trash2 className="size-3.5" />
            </Button>

            <ContactListFormModal isOpen={editOpen} onOpenChange={setEditOpen} editing={list} />
            <ConfirmDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this list?"
                description="Contacts will not be deleted — only their membership in this list."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={del.isPending}
                onConfirm={() => del.mutate(list.uuid, { onSuccess: () => setDeleteOpen(false) })}
            />
        </div>
    );
}

const columnHelper = createColumnHelper<ContactList>();

interface ContactListsTableProps {
    lists: ContactList[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ContactListsTable({
    lists,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
}: ContactListsTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor("title", {
                id: "title",
                header: "Title",
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
            columnHelper.accessor(
                (row) => row.contact_count ?? row._count?.members ?? 0,
                {
                    id: "contacts",
                    header: "Contacts",
                    cell: (info) => (
                        <span className="text-sm text-muted">{info.getValue()}</span>
                    ),
                },
            ),
            columnHelper.accessor("updated_at", {
                id: "updated_at",
                header: "Updated",
                cell: (info) => (
                    <span className="text-sm text-muted whitespace-nowrap">
                        {formatDate(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => <RowActions list={info.row.original} />,
            }),
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: lists,
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
                        aria-label="Contact lists"
                        className="min-w-[700px]"
                    >
                        <Table.Header>
                            {table.getHeaderGroups()[0]!.headers.map((header) => (
                                <Table.Column
                                    key={header.id}
                                    id={header.id}
                                    isRowHeader={header.id === "title"}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </Table.Column>
                            ))}
                        </Table.Header>
                        <Table.Body
                            renderEmptyState={() =>
                                isLoading ? null : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted">
                                        <p className="text-sm">No lists found.</p>
                                        <p className="text-xs">
                                            Create your first list to organize contacts.
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
                                      const rowHref = Routes.dashboard.lists_detail.replace(":uuid", row.id);
                                      const rowLabel = `View list ${row.original.title}`;

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
                                                      primaryColumnId: "title",
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
                        label="lists"
                    />
                </Table.Footer>
            </Table>
        </div>
    );
}
