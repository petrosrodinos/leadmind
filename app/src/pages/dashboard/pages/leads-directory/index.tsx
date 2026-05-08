import { useMemo, useState } from "react";
import {
    Button,
    Drawer,
    Input,
    Label,
    ListBox,
    Pagination,
    Select,
    Table,
    useOverlayState,
} from "@heroui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Check, Plus, Search, Sparkles } from "lucide-react";
import type { Lead, SourceType } from "@/features/leads/interfaces/lead.interface";
import { SOURCE_LABEL, SOURCE_OPTIONS } from "@/features/leads/constants/source-options";
import { SourceBadge } from "@/features/leads/components/source-badge";
import { useEnrichLead, useLeads } from "@/features/leads/hooks/use-leads";
import { useAddLeadToCrm } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<Lead>();

export default function LeadsDirectoryPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sourceType, setSourceType] = useState<SourceType | undefined>(undefined);
    const [selected, setSelected] = useState<Lead | null>(null);

    const drawerState = useOverlayState();

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
    const enrich = useEnrichLead();

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

    const openLeadDrawer = (lead: Lead) => {
        setSelected(lead);
        drawerState.open();
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
                                            onAction={() => openLeadDrawer(row.original)}
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

            <Drawer.Backdrop isOpen={drawerState.isOpen} onOpenChange={drawerState.setOpen}>
                <Drawer.Content placement="right">
                    <Drawer.Dialog className="sm:max-w-xl">
                        <Drawer.CloseTrigger />
                        <Drawer.Header>
                            <Drawer.Heading>{selected?.name ?? "Lead"}</Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.Body>
                            {selected && (
                                <div className="flex flex-col gap-5">
                                    <Field label="Company" value={selected.company} />
                                    <Field label="Email" value={selected.email} />
                                    <Field label="Phone" value={selected.phone} />
                                    <Field label="Title" value={selected.title} />
                                    <Field label="Location" value={selected.location} />
                                    <Field label="Industry" value={selected.industry} />
                                    <Field label="Website" value={selected.website} link />
                                    <Field label="LinkedIn" value={selected.linkedin_url} link />
                                    <Field label="Description" value={selected.description} />
                                    <Field
                                        label="Source"
                                        value={SOURCE_LABEL[selected.source_type]}
                                    />
                                    <EnrichmentBlock
                                        enrichment={selected.enrichment_data}
                                        onEnrich={() => enrich.mutate(selected.uuid)}
                                        loading={enrich.isPending}
                                    />
                                </div>
                            )}
                        </Drawer.Body>
                        <Drawer.Footer>
                            <Button slot="close" variant="secondary">
                                Close
                            </Button>
                            <Button
                                isDisabled={
                                    !selected ||
                                    addToCrm.isPending ||
                                    (selected && adoptedUuids.has(selected.uuid)) ||
                                    false
                                }
                                onPress={() => {
                                    if (!selected) return;
                                    addToCrm.mutate(selected.uuid, {
                                        onSuccess: () => {
                                            setAdoptedUuids((prev) =>
                                                new Set(prev).add(selected.uuid),
                                            );
                                        },
                                        onError: (error: any) => {
                                            if (error.status === 409) {
                                                setAdoptedUuids((prev) =>
                                                    new Set(prev).add(selected.uuid),
                                                );
                                            }
                                        },
                                    });
                                }}
                            >
                                {selected && adoptedUuids.has(selected.uuid) ? (
                                    <>
                                        <Check className="size-4" />
                                        Added
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-4" />
                                        Add to my CRM
                                    </>
                                )}
                            </Button>
                        </Drawer.Footer>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </div>
    );
}

function Field({
    label,
    value,
    link = false,
}: {
    label: string;
    value: string | null | undefined;
    link?: boolean;
}) {
    if (!value) {
        return (
            <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
                <p className="text-sm text-muted italic mt-0.5">Not provided</p>
            </div>
        );
    }
    return (
        <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
            {link ? (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline mt-0.5 break-all"
                >
                    {value}
                </a>
            ) : (
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-line">{value}</p>
            )}
        </div>
    );
}

function EnrichmentBlock({
    enrichment,
    onEnrich,
    loading,
}: {
    enrichment: Record<string, unknown> | null | undefined;
    onEnrich: () => void;
    loading: boolean;
}) {
    return (
        <div className="rounded-lg border border-border bg-surface-secondary p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wide">
                    Public enrichment summary
                </p>
                <Button
                    size="sm"
                    variant="tertiary"
                    isDisabled={loading}
                    isPending={loading}
                    onPress={onEnrich}
                >
                    <Sparkles className="size-3.5" />
                    Enrich
                </Button>
            </div>
            {enrichment && Object.keys(enrichment).length > 0 ? (
                <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(enrichment, null, 2)}
                </pre>
            ) : (
                <p className="text-sm text-muted italic">
                    No enrichment yet. Click <span className="font-medium">Enrich</span> to queue
                    an AI summary of this lead's website.
                </p>
            )}
        </div>
    );
}
