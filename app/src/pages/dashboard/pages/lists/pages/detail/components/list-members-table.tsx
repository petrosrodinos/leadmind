import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Routes } from "@/routes/routes";
import { TablePagination } from "@/components/ui/table-pagination";
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
}: ListMembersTableProps) {
    const navigate = useNavigate();
    const removeContact = useRemoveListContact();

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                header: "Name",
                cell: (info) => (
                    <span className="font-medium text-foreground">{info.getValue() ?? "—"}</span>
                ),
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
                cell: (info) => (
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="sm"
                            variant="tertiary"
                            className="text-danger"
                            isDisabled={removeContact.isPending}
                            onPress={() =>
                                removeContact.mutate({
                                    listUuid,
                                    contactUuid: info.row.original.uuid,
                                })
                            }
                            aria-label="Remove from list"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                ),
            }),
        ],
        [listUuid, removeContact],
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
                        onRowAction={(uuid) =>
                            navigate(Routes.dashboard.contacts_detail.replace(":uuid", String(uuid)))
                        }
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
                                      <Table.Row key={row.id} id={row.id}>
                                          {row.getVisibleCells().map((cell) => (
                                              <Table.Cell key={cell.id}>
                                                  {flexRender(
                                                      cell.column.columnDef.cell,
                                                      cell.getContext(),
                                                  )}
                                              </Table.Cell>
                                          ))}
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
