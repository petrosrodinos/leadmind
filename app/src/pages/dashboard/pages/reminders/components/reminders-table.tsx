import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table } from "@heroui/react";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Routes } from "@/routes/routes";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReminderStatusBadge, ReminderFormModal } from "@/components/reminders";
import { useCompleteReminder, useDeleteReminder } from "@/features/reminders/hooks/use-reminders";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import type { Reminder } from "@/features/reminders/interfaces/reminder.interface";

function formatReminderDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function RowActions({ reminder }: { reminder: Reminder }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const complete = useCompleteReminder();
    const del = useDeleteReminder();

    return (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setEditOpen(true)}
                aria-label="Edit reminder"
            >
                <Pencil className="size-3.5" />
            </Button>
            {reminder.status === "PENDING" && (
                <ActionButtonWithPending
                    size="sm"
                    variant="tertiary"
                    isDisabled={complete.isPending}
                    isPending={complete.isPending}
                    onPress={() => complete.mutate(reminder.uuid)}
                    className="text-green-600 hover:text-green-700"
                    aria-label="Complete reminder"
                >
                    <CheckCircle2 className="size-3.5" />
                </ActionButtonWithPending>
            )}
            <Button
                size="sm"
                variant="tertiary"
                onPress={() => setDeleteOpen(true)}
                className="text-danger"
                aria-label="Delete reminder"
            >
                <Trash2 className="size-3.5" />
            </Button>

            <ReminderFormModal
                contactUuid={reminder.contact_uuid}
                isOpen={editOpen}
                onOpenChange={setEditOpen}
                editing={reminder}
            />
            <ConfirmDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this reminder?"
                description="This action cannot be undone. The scheduled notification will also be cancelled."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={del.isPending}
                onConfirm={() => del.mutate(reminder.uuid, { onSuccess: () => setDeleteOpen(false) })}
            />
        </div>
    );
}

const columnHelper = createColumnHelper<Reminder>();

interface RemindersTableProps {
    reminders: Reminder[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function RemindersTable({
    reminders,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
}: RemindersTableProps) {
    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.title, {
                id: "title",
                header: "Title",
                cell: (info) => (
                    <span className="font-medium text-foreground">
                        {info.getValue() ?? "Reminder"}
                    </span>
                ),
            }),
            columnHelper.accessor((row) => row.contact, {
                id: "contact",
                header: "Contact",
                cell: (info) => {
                    const c = info.getValue();
                    const contactUuid = info.row.original.contact_uuid;
                    const contactHref = Routes.dashboard.contacts_detail.replace(":uuid", contactUuid);
                    return (
                        <Link
                            to={contactHref}
                            className="relative z-[1] flex flex-col items-start text-left group"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                                {c.name ?? c.email ?? "—"}
                            </span>
                            {c.company && (
                                <span className="text-xs text-muted">{c.company}</span>
                            )}
                        </Link>
                    );
                },
            }),
            columnHelper.accessor("remind_at", {
                id: "remind_at",
                header: "Reminder Date",
                cell: (info) => (
                    <span className="text-sm text-muted whitespace-nowrap">
                        {formatReminderDate(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.accessor("status", {
                id: "status",
                header: "Status",
                cell: (info) => <ReminderStatusBadge status={info.getValue()} />,
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => <RowActions reminder={info.row.original} />,
            }),
        ],
        [],
    );

    const table = useReactTable({
        columns,
        data: reminders,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Reminders" className="min-w-[700px]">
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
                                        <p className="text-sm">No reminders found.</p>
                                        <p className="text-xs">
                                            Try adjusting your filters or create a new reminder.
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
                                      const rowHref = Routes.dashboard.contacts_detail.replace(":uuid", row.original.contact_uuid);
                                      const rowLabel = `View contact for reminder ${row.original.title ?? "details"}`;

                                      return (
                                      <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                                          {row.getVisibleCells().map((cell) => {
                                              const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                                              const isInteractive = isTableNavInteractiveCell(cell.column.id, ["contact", "actions"]);

                                              return (
                                              <Table.Cell
                                                  key={cell.id}
                                                  className={isInteractive ? tableNavInteractiveCellClassName : undefined}
                                              >
                                                  {renderTableNavCellContent(cell.column.id, rowHref, content, {
                                                      interactiveColumnIds: ["contact", "actions"],
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
                        label="reminders"
                    />
                </Table.Footer>
            </Table>
        </div>
    );
}
