import { useMemo, useState } from "react";
import type { Selection } from "@heroui/react";
import {
    Button,
    Checkbox,
    Chip,
    ListBox,
    Pagination,
    Select,
    Table,
} from "@heroui/react";
import { Trash } from "lucide-react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import {
    LeadStatus,
    MsgStatus,
} from "@/features/contacts/interfaces/contact.interface";
import { SourceBadge } from "@/features/leads/components/source-badge";
import {
    useDeleteContact,
    useUpdateContactStatus,
} from "@/features/contacts/hooks/use-contacts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScoreBadge } from "./badges";

const STATUS_OPTIONS: Array<{ id: LeadStatus; label: string }> = [
    { id: LeadStatus.NEW, label: "New" },
    { id: LeadStatus.CONTACTED, label: "Contacted" },
    { id: LeadStatus.CONVERTED, label: "Converted" },
    { id: LeadStatus.ARCHIVED, label: "Archived" },
];

const columnHelper = createColumnHelper<Contact>();

interface LeadsTableProps {
    contacts: Contact[];
    isLoading: boolean;
    isFetching: boolean;
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRowClick: (contact: Contact) => void;
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
}

export function LeadsTable({
    contacts,
    isLoading,
    isFetching,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onRowClick,
    selectedKeys,
    onSelectionChange,
}: LeadsTableProps) {
    const updateStatus = useUpdateContactStatus();
    const deleteContact = useDeleteContact();
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.lead.name, {
                id: "name",
                header: "Name",
                cell: (info) => (
                    <span className="font-medium text-foreground">
                        {info.getValue() ?? "—"}
                    </span>
                ),
            }),
            columnHelper.accessor((row) => row.lead.company, {
                id: "company",
                header: "Company",
                cell: (info) => info.getValue() ?? "—",
            }),
            columnHelper.accessor((row) => row.lead.email, {
                id: "email",
                header: "Email",
                cell: (info) => info.getValue() ?? "—",
            }),
            columnHelper.accessor("score", {
                id: "score",
                header: "Score",
                cell: (info) => <ScoreBadge score={info.getValue()} />,
            }),
            columnHelper.accessor((row) => row.lead.source_type, {
                id: "source",
                header: "Source",
                cell: (info) => <SourceBadge source={info.getValue()} />,
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
                                            <ListBox.Item
                                                key={opt.id}
                                                id={opt.id}
                                                textValue={opt.label}
                                            >
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
                id: "drafts",
                header: "Drafts",
                cell: (info) => {
                    const drafts =
                        info.row.original.outreach_messages?.filter(
                            (m) => m.status === MsgStatus.PENDING,
                        ).length ?? 0;
                    return (
                        <Chip
                            size="sm"
                            variant="soft"
                            color={drafts > 0 ? "warning" : "default"}
                        >
                            <Chip.Label>{drafts}</Chip.Label>
                        </Chip>
                    );
                },
            }),
            columnHelper.display({
                id: "actions",
                header: "",
                cell: (info) => (
                    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
                        <Button
                            size="sm"
                            variant="tertiary"
                            className="text-danger"
                            isDisabled={deleteContact.isPending}
                            onPress={() => setDeleteTarget(info.row.original)}
                            aria-label={`Delete ${info.row.original.lead.name ?? "contact"}`}
                        >
                            <Trash className="size-3.5" />
                        </Button>
                    </div>
                ),
            }),
        ],
        [updateStatus, deleteContact.isPending],
    );

    const table = useReactTable({
        columns,
        data: contacts,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        manualPagination: true,
        pageCount: totalPages,
    });

    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

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
                        aria-label="My leads (contacts)"
                        className="min-w-[1000px]"
                        selectionMode="multiple"
                        selectionBehavior="toggle"
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                        onRowAction={(key) => {
                            const contact = contacts.find((c) => c.uuid === key);
                            if (contact) onRowClick(contact);
                        }}
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
                                        <p className="text-sm">
                                            No contacts match your filters.
                                        </p>
                                        <p className="text-xs">
                                            Adopt a lead from the Public Leads Directory to
                                            get started.
                                        </p>
                                    </div>
                                )
                            }
                        >
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
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
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <Table.Row
                                        key={row.id}
                                        id={row.id}
                                        className="cursor-pointer"
                                    >
                                        <Table.Cell className="pr-0">
                                            <Checkbox
                                                aria-label={`Select ${row.original.lead.name ?? "contact"}`}
                                                slot="selection"
                                            >
                                                <Checkbox.Control>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Control>
                                            </Checkbox>
                                        </Table.Cell>
                                        {row.getVisibleCells().map((cell) => (
                                            <Table.Cell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Table.Cell>
                                        ))}
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
                <Table.Footer>
                    <Pagination size="sm">
                        <Pagination.Summary>
                            {start} to {end} of {total} contacts
                            {isFetching && !isLoading ? " · refreshing…" : ""}
                        </Pagination.Summary>
                        <Pagination.Content>
                            <Pagination.Item>
                                <Pagination.Previous
                                    isDisabled={page <= 1}
                                    onPress={() => onPageChange(Math.max(1, page - 1))}
                                >
                                    <Pagination.PreviousIcon />
                                    Prev
                                </Pagination.Previous>
                            </Pagination.Item>
                            <Pagination.Item>
                                <Pagination.Link isActive>{page}</Pagination.Link>
                            </Pagination.Item>
                            <Pagination.Item>
                                <Pagination.Next
                                    isDisabled={page >= totalPages}
                                    onPress={() =>
                                        onPageChange(Math.min(totalPages, page + 1))
                                    }
                                >
                                    Next
                                    <Pagination.NextIcon />
                                </Pagination.Next>
                            </Pagination.Item>
                        </Pagination.Content>
                    </Pagination>
                </Table.Footer>
            </Table>

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title={`Delete contact "${deleteTarget?.lead.name ?? "this contact"}"?`}
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
