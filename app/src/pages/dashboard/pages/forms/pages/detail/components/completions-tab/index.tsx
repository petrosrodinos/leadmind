import { useState } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useFormCompletions } from "@/features/forms/hooks/use-form-completions";
import type { FormField } from "@/features/forms/interfaces/form.interface";
import { CompletionsTable } from "./completions-table";
import { CompleteFormModal } from "./complete-form-modal";

const PAGE_SIZE = 20;

interface CompletionsTabProps {
    formUuid: string;
    fields: FormField[];
}

export function CompletionsTab({ formUuid, fields }: CompletionsTabProps) {
    const [page, setPage] = useState(1);
    const [completeOpen, setCompleteOpen] = useState(false);

    const { data: completionsPage, isLoading, isFetching } = useFormCompletions(formUuid, {
        page,
        limit: PAGE_SIZE,
    });

    const completions = completionsPage?.data ?? [];
    const total = completionsPage?.total ?? 0;
    const totalPages = completionsPage?.totalPages ?? 1;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                    {total > 0 ? `${total} completion${total !== 1 ? "s" : ""}` : "Completions"}
                </p>
                <Button size="sm" variant="secondary" onPress={() => setCompleteOpen(true)}>
                    <Plus className="size-3.5" />
                    Record Completion
                </Button>
            </div>

            <CompletionsTable
                formUuid={formUuid}
                completions={completions}
                fields={fields}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <CompleteFormModal
                formUuid={formUuid}
                fields={fields}
                isOpen={completeOpen}
                onOpenChange={setCompleteOpen}
            />
        </div>
    );
}
