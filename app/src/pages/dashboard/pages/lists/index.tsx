import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Input } from "@heroui/react";
import { List, Plus, Search } from "lucide-react";
import { useContactLists } from "@/features/contact-lists/hooks/use-contact-lists";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ContactListsTable } from "./components/contact-lists-table";
import { ContactListFormModal } from "./components/contact-list-form-modal";

const PAGE_SIZE = 20;

export default function ListsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const debouncedSearch = useDebouncedValue(search, 300);

    const { data: listsPage, isLoading, isFetching } = useContactLists({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
    });

    const lists = listsPage?.data ?? [];
    const total = listsPage?.total ?? 0;
    const totalPages = listsPage?.totalPages ?? 1;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <List className="size-5 text-muted" />
                    <h1 className="text-xl font-semibold text-foreground">Lists</h1>
                </div>
                <Button size="sm" variant="secondary" onPress={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    New list
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="size-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                    placeholder="Search lists…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
                    fullWidth
                />
            </div>

            <ContactListsTable
                lists={lists}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
            />

            <ContactListFormModal isOpen={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
