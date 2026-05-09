import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Input,
    Label,
    ListBox,
    Pagination,
    Select,
    Table,
} from "@heroui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Check, Plus, Search } from "lucide-react";
import type { Lead, SourceType } from "@/features/leads/interfaces/lead.interface";
import { SOURCE_OPTIONS } from "@/features/leads/constants/source-options";
import { SourceBadge } from "@/features/leads/components/source-badge";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useAddLeadToCrm } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Routes } from "@/routes/routes";

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<Lead>();

export default function LeadsDirectoryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sourceType, setSourceType] = useState<SourceType | undefined>(undefined);

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

    const { data, isLoading, isFetching } = useLeads(query);
    const addToCrm = useAddLeadToCrm();

    const [adoptedUuids, setAdoptedUuids] = useState<Set<string>>(new Set());

    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                header: "Name",
                cell: (info) => (
                    <span className="font-medium text-foreground">
                        {info.getValue() ?? "—"}
                    </span>
                ),
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
                        <div
                            className="flex justify-end"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            role="presentation"
                        >
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
                                                setAdoptedUuids((prev) =>
                                                    new Set(prev).add(lead.uuid),
                                                );
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
        manualPagination: true,
        pageCount: data?.totalPages ?? 0,
    });

    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);

    const openLeadDetail = (lead: Lead) => {
        navigate(Routes.dashboard.leads_directory_detail.replace(":uuid", lead.uuid));
    };

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
            </div>

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <Table>
                    <Table.ScrollContainer>
                        <Table.Content
                            aria-label="Public leads directory"
                            className="min-w-[900px]"
                        >
                            <Table.Header>
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
                                        <div className="flex items-center justify-center py-12 text-center text-sm text-muted">
                                            No leads match your filters.
                                        </div>
                                    )
                                }
                            >
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
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
                                            onAction={() => openLeadDetail(row.original)}
                                            className="cursor-pointer"
                                        >
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
                                {start} to {end} of {total} results
                                {isFetching && !isLoading ? " · refreshing…" : ""}
                            </Pagination.Summary>
                            <Pagination.Content>
                                <Pagination.Item>
                                    <Pagination.Previous
                                        isDisabled={page <= 1}
                                        onPress={() => setPage((p) => Math.max(1, p - 1))}
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
                                            setPage((p) => Math.min(totalPages, p + 1))
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
            </div>
        </div>
    );
}
