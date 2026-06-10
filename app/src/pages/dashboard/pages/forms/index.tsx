import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Input } from "@heroui/react";
import { ClipboardList, Plus, Search } from "lucide-react";
import { useForms } from "@/features/forms/hooks/use-forms";
import { useFormWebSocket } from "@/features/forms/hooks/use-form-websocket";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { FormsTable } from "./components/forms-table";
import { FormFormModal } from "./components/form-form-modal";

const PAGE_SIZE = 20;

export default function FormsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);

    useFormWebSocket();

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

    const { data: formsPage, isLoading, isFetching } = useForms({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
    });

    const forms = formsPage?.data ?? [];
    const total = formsPage?.total ?? 0;
    const totalPages = formsPage?.totalPages ?? 1;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ClipboardList className="size-5 text-muted" />
                    <h1 className="text-xl font-semibold text-foreground">Forms</h1>
                </div>
                <Button size="sm" variant="secondary" onPress={() => setCreateOpen(true)}>
                    <Plus className="size-3.5" />
                    New Form
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    className="max-w-xs"
                    placeholder="Search forms…"
                    value={search}
                    onChange={(e) => updateParams({ search: e.target.value || null, page: "1" })}
                    startContent={<Search className="size-3.5 text-muted" />}
                />
            </div>

            <FormsTable
                forms={forms}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
            />

            <FormFormModal isOpen={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
