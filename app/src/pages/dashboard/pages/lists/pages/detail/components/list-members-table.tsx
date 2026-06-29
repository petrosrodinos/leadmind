import { useMemo } from "react";
import type { Selection } from "@heroui/react";
import { Button, Checkbox, Table } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { isTableNavInteractiveCell, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";
import { useRemoveListContact } from "@/features/contact-lists/hooks/use-contact-lists";
import {
    ContactTableDetailLink,
    ContactTableNameCell,
    ContactTableQuickViewButton,
} from "@/pages/dashboard/components/contact-stack-viewer";

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
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
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
    selectedKeys,
    onSelectionChange,
}: ListMembersTableProps) {
    const removeContact = useRemoveListContact();

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.name, {
                id: "name",
                header: "Name",
                cell: (info) => {
                    const contact = info.row.original;
                    return (
                        <ContactTableNameCell
                            contactUuid={contact.uuid}
                            name={info.getValue()}
                            onOpen={onContactOpen}
                        />
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

                    return (
                        <div className="flex justify-end items-center gap-1">
                            <ContactTableQuickViewButton
                                contactUuid={contact.uuid}
                                contactName={contact.name}
                                onOpen={onContactOpen}
                            />
                            <ContactTableDetailLink contactUuid={contact.uuid} contactName={contact.name} />
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

    const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") {
            onSelectionChange(new Set(contacts.map((c) => c.uuid)));
        } else {
            onSelectionChange(new Set(Array.from(keys, String)));
        }
    };

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label="List members"
                        className="min-w-[640px]"
                        selectionMode="multiple"
                        selectionBehavior="toggle"
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                    >
                        <Table.Header>
                            <Table.Column className="pr-0 w-10">
                                <Checkbox aria-label="Select all" slot="selection">
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                </Checkbox>
                            </Table.Column>
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
                                          <Table.Cell className="pr-0">
                                              <div className="h-4 w-4 rounded bg-surface-secondary animate-pulse" />
                                          </Table.Cell>
                                          {columns.map((c) => (
                                              <Table.Cell key={c.id}>
                                                  <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                                              </Table.Cell>
                                          ))}
                                      </Table.Row>
                                  ))
                                : table.getRowModel().rows.map((row) => (
                                      <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                                          <Table.Cell className={`pr-0 ${tableNavInteractiveCellClassName}`}>
                                              <Checkbox
                                                  aria-label={`Select ${row.original.name ?? "contact"}`}
                                                  slot="selection"
                                              >
                                                  <Checkbox.Control>
                                                      <Checkbox.Indicator />
                                                  </Checkbox.Control>
                                              </Checkbox>
                                          </Table.Cell>
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
