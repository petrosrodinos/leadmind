import { useMemo } from "react";
import { Button, Table } from "@heroui/react";
import { ChevronsUpDown, ExternalLink, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Routes } from "@/routes/routes";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";
import { useRemoveListContact } from "@/features/contact-lists/hooks/use-contact-lists";

const columnHelper = createColumnHelper<Contact>();

interface ListMembersTableProps {
    listUuid: string;
    contacts: Contact[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onContactOpen?: (contactUuid: string) => void;
}

export function ListMembersTable({
    listUuid,
    contacts,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onContactOpen,
}: ListMembersTableProps) {
    const removeContact = useRemoveListContact();

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                header: "Name",
                cell: (info) => {
                    const contact = info.row.original;
                    const name = info.getValue() ?? "—";

                    return onContactOpen ? (
                        <button
                            type="button"
                            onClick={() => onContactOpen(contact.uuid)}
                            className="font-medium text-foreground truncate text-left hover:text-accent transition-colors max-w-full"
                        >
                            {name}
                        </button>
                    ) : (
                        <span className="font-medium text-foreground truncate">{name}</span>
                    );
                },
            }),
            columnHelper.accessor((row) => row.company, {
                id: "company",
                header: "Company",
                cell: (info) => info.getValue() ?? "—",
            }),
            columnHelper.accessor((row) => row.email, {
                id: "email",
                header: "Email",
                cell: (info) => info.getValue() ?? "—",
            }),
            columnHelper.display({
                id: "score",
                header: "Score",
                cell: (info) => <ContactScoresCompact contact={info.row.original} />,
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => {
                    const contact = info.row.original;
                    const detailHref = Routes.dashboard.contacts_detail.replace(":uuid", contact.uuid);

                    return (
                        <div className="flex justify-end items-center gap-1">
                            {onContactOpen ? (
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onPress={() => onContactOpen(contact.uuid)}
                                    aria-label={`Quick view ${contact.name ?? "contact"}`}
                                >
                                    <ChevronsUpDown className="size-3.5" />
                                </Button>
                            ) : null}
                            <Link
                                to={detailHref}
                                aria-label={`Open ${contact.name ?? "contact"} in full page`}
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted hover:text-accent hover:bg-surface-secondary transition-colors"
                            >
                                <ExternalLink className="size-3.5" />
                            </Link>
                            <Button
                                size="sm"
                                variant="tertiary"
                                className="text-danger"
                                isDisabled={removeContact.isPending}
                                onPress={() =>
                                    removeContact.mutate({
                                        listUuid,
                                        contactUuid: contact.uuid,
                                    })
                                }
                                aria-label="Remove from list"
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>
                    );
                },
            }),
        ],
        [listUuid, onContactOpen, removeContact],
    );

    const table = useReactTable({
        columns,
        data: contacts,
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
                        aria-label="List members"
                        className="min-w-[640px]"
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
                                        <p className="text-sm">No contacts in this list yet.</p>
                                        <p className="text-xs">
                                            Use the filters below to find and add contacts.
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
                                : table.getRowModel().rows.map((row) => (
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
                                                      className={
                                                          isInteractive
                                                              ? tableNavInteractiveCellClassName
                                                              : undefined
                                                      }
                                                  >
                                                      {content}
                                                  </Table.Cell>
                                              );
                                          })}
                                      </Table.Row>
                                  ))}
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
                        label="contacts"
                    />
                </Table.Footer>
            </Table>
        </div>
    );
}
