import { useMemo, useState } from "react";
import type { Selection } from "@heroui/react";
import { Button, Checkbox, Chip, ListBox, Select, Table } from "@heroui/react";
import { TablePagination } from "@/components/ui/table-pagination";
import { Trash } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { useDeleteContact, useUpdateContactStatus } from "@/features/contacts/hooks/use-contacts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isTableNavInteractiveCell, renderTableNavCellContent, tableNavInteractiveCellClassName, tableNavRowClassName } from "@/components/ui/table-row-link";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";
import {
  ContactTableDetailLink,
  ContactTableNameCell,
  ContactTableQuickViewButton,
} from "@/pages/dashboard/components/contact-stack-viewer";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";
import { Routes } from "@/routes/routes";
import { ContactAlsoFoundByHint } from "@/pages/dashboard/components/contact-also-found-by-hint";

const lastInteractionAt = (contact: Contact): string | null => {
  const interactions = contact.interactions ?? [];
  if (interactions.length === 0) return null;
  let latest = interactions[0]!.created_at;
  for (const i of interactions) {
    if (i.created_at > latest) latest = i.created_at;
  }
  return latest;
};

const columnHelper = createColumnHelper<Contact>();

interface ContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  onContactOpen?: (contactUuid: string) => void;
}

export function ContactsTable({ contacts, isLoading, isFetching, page, pageSize, total, totalPages, onPageChange, selectedKeys, onSelectionChange, onContactOpen }: ContactsTableProps) {
  const updateStatus = useUpdateContactStatus();
  const deleteContact = useDeleteContact();
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

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
      columnHelper.accessor((row) => row.phone, {
        id: "phone",
        header: "Phone",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: (info) => {
          const contact = info.row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Select
                aria-label="Status"
                value={contact.status}
                onChange={(v) =>
                  updateStatus.mutate({
                    uuid: contact.uuid,
                    status: v as LeadStatus,
                  })
                }
              >
                <Select.Trigger className="min-w-32">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {STATUS_OPTIONS.map((opt) => (
                      <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                        {opt.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "score",
        header: "Score",
        cell: (info) => <ContactScoresCompact contact={info.row.original} />,
      }),
      columnHelper.display({
        id: "filters",
        header: "Filters",
        cell: (info) => {
          const hint = <ContactAlsoFoundByHint contact={info.row.original} />;
          return hint ?? <span className="text-muted">—</span>;
        },
      }),
      columnHelper.accessor("tags", {
        id: "tags",
        header: "Tags",
        cell: (info) => {
          const tags = info.getValue();
          if (!tags || tags.length === 0) {
            return <span className="text-muted">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-48">
              {tags.slice(0, 3).map((t) => (
                <Chip key={t} size="sm" variant="soft">
                  <Chip.Label>{t}</Chip.Label>
                </Chip>
              ))}
              {tags.length > 3 && <span className="text-xs text-muted self-center">+{tags.length - 3}</span>}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => lastInteractionAt(row), {
        id: "last_interaction",
        header: "Last interaction",
        cell: (info) => {
          const v = info.getValue();
          if (!v) return <span className="text-muted">—</span>;
          return <span className="text-xs text-muted whitespace-nowrap">{formatDistanceToNow(new Date(v), { addSuffix: true })}</span>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const contact = info.row.original;
          return (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-end items-center gap-1">
            <ContactTableQuickViewButton
              contactUuid={contact.uuid}
              contactName={contact.name}
              onOpen={onContactOpen}
            />
            {onContactOpen ? (
              <ContactTableDetailLink contactUuid={contact.uuid} contactName={contact.name} />
            ) : null}
            <Button size="sm" variant="tertiary" className="text-danger" isDisabled={deleteContact.isPending} onPress={() => setDeleteTarget(info.row.original)} aria-label={`Delete ${info.row.original.name ?? "contact"}`}>
              <Trash className="size-3.5" />
            </Button>
          </div>
          );
        },
      }),
    ],
    [updateStatus, deleteContact.isPending, onContactOpen],
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteContact.mutateAsync(deleteTarget.uuid);
    setDeleteTarget(null);
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Contacts"
            className="min-w-[1100px]"
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
                <Table.Column key={header.id} id={header.id} isRowHeader={header.id === "name"}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body
              renderEmptyState={() =>
                isLoading ? null : (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted">
                    <p className="text-sm">No contacts match your filters.</p>
                    <p className="text-xs">Adopt a lead from the directory or add one manually.</p>
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
                : table.getRowModel().rows.map((row) => {
                    const rowHref = Routes.dashboard.contacts_detail.replace(":uuid", row.id);
                    const rowLabel = `View contact ${row.original.name ?? row.original.email ?? "details"}`;
                    const interactiveColumnIds = onContactOpen
                      ? ["name", "status", "actions"]
                      : ["status", "actions"];

                    return (
                    <Table.Row key={row.id} id={row.id} className={tableNavRowClassName}>
                      <Table.Cell className={`pr-0 ${tableNavInteractiveCellClassName}`}>
                        <Checkbox aria-label={`Select ${row.original.name ?? "contact"}`} slot="selection">
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </Table.Cell>
                      {row.getVisibleCells().map((cell) => {
                        const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                        const isInteractive = isTableNavInteractiveCell(cell.column.id, interactiveColumnIds);

                        return (
                        <Table.Cell
                          key={cell.id}
                          className={isInteractive ? tableNavInteractiveCellClassName : undefined}
                        >
                          {isInteractive
                            ? content
                            : renderTableNavCellContent(cell.column.id, rowHref, content, {
                            interactiveColumnIds,
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
          <TablePagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={onPageChange} isFetching={isFetching} isLoading={isLoading} label="contacts" />
        </Table.Footer>
      </Table>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete contact "${deleteTarget?.name ?? "this contact"}"?`}
        description="This removes the contact from your CRM. The underlying lead record stays in the public directory."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isPending={deleteContact.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
