import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ClipboardList, ExternalLink, Plus } from "lucide-react";
import { useContactCompletions } from "@/features/forms/hooks/use-form-completions";
import { useForms } from "@/features/forms/hooks/use-forms";
import { Routes } from "@/routes/routes";
import { CompleteFormModal } from "@/pages/dashboard/pages/forms/pages/detail/components/completions-tab/complete-form-modal";
import type { Form } from "@/features/forms/interfaces/form.interface";
import type { ContactCompletionSummary } from "@/features/forms/interfaces/form-completion.interface";

function formatDate(d: string) {
    return new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function groupByForm(
    completions: ContactCompletionSummary[],
): Map<string, { form: { uuid: string; name: string }; completions: ContactCompletionSummary[] }> {
    const map = new Map<
        string,
        { form: { uuid: string; name: string }; completions: ContactCompletionSummary[] }
    >();
    for (const c of completions) {
        if (!map.has(c.form_uuid)) {
            map.set(c.form_uuid, { form: c.form, completions: [] });
        }
        map.get(c.form_uuid)!.completions.push(c);
    }
    return map;
}

interface FormRowProps {
    contactUuid: string;
    contactName?: string | null;
    form: Form;
    completions: ContactCompletionSummary[];
}

function FormRow({ contactUuid, contactName, form, completions }: FormRowProps) {
    const navigate = useNavigate();
    const [completeOpen, setCompleteOpen] = useState(false);
    const lastCompletion = completions[0];

    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/80 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{form.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                    <span>
                        {completions.length} completion{completions.length !== 1 ? "s" : ""}
                    </span>
                    {lastCompletion && (
                        <>
                            <span>·</span>
                            <span>Last: {formatDate(lastCompletion.created_at)}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setCompleteOpen(true)}
                    className="text-xs"
                >
                    <Plus className="size-3" />
                    Complete
                </Button>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() =>
                        navigate(Routes.dashboard.forms_detail.replace(":uuid", form.uuid))
                    }
                    aria-label="View form completions"
                >
                    <ExternalLink className="size-3.5" />
                </Button>
            </div>

            <CompleteFormModal
                formUuid={form.uuid}
                contactUuid={contactUuid}
                contactName={contactName ?? undefined}
                isOpen={completeOpen}
                onOpenChange={setCompleteOpen}
            />
        </div>
    );
}

interface FormsTabProps {
    contactUuid: string;
    contactName?: string | null;
}

export function FormsTab({ contactUuid, contactName }: FormsTabProps) {
    const [newCompleteFormUuid, setNewCompleteFormUuid] = useState<string | null>(null);

    const { data: completions = [], isLoading: completionsLoading } =
        useContactCompletions(contactUuid);

    const { data: formsPage, isLoading: formsLoading } = useForms({ limit: 100 });
    const allForms = formsPage?.data ?? [];

    const grouped = groupByForm(completions);
    const formsWithCompletions = Array.from(grouped.values());

    const formsWithoutCompletions = allForms.filter((f) => !grouped.has(f.uuid));

    const selectedForm = allForms.find((f) => f.uuid === newCompleteFormUuid) ?? null;

    return (
        <div className="flex flex-col gap-4 max-w-3xl">
            <div className="rounded-2xl border border-border/80 bg-surface/80">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="size-4 text-muted" />
                        <h3 className="text-sm font-semibold text-foreground">Forms</h3>
                    </div>
                </div>

                <div className="p-5 space-y-2">
                    {completionsLoading || formsLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-16 rounded-xl bg-surface-secondary animate-pulse"
                            />
                        ))
                    ) : (
                        <>
                            {formsWithCompletions.length > 0 && (
                                <div className="space-y-2">
                                    {formsWithCompletions.map(({ form, completions: comps }) => {
                                        const fullForm = allForms.find((f) => f.uuid === form.uuid);
                                        if (!fullForm) return null;
                                        return (
                                            <FormRow
                                                key={form.uuid}
                                                contactUuid={contactUuid}
                                                contactName={contactName}
                                                form={fullForm}
                                                completions={comps}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {formsWithoutCompletions.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                                        Start New Completion
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {formsWithoutCompletions.map((f) => (
                                            <Button
                                                key={f.uuid}
                                                size="sm"
                                                variant="tertiary"
                                                onPress={() => setNewCompleteFormUuid(f.uuid)}
                                            >
                                                <Plus className="size-3" />
                                                {f.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allForms.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <ClipboardList className="size-8 text-muted/40 mb-3" />
                                    <p className="text-sm font-medium text-foreground">
                                        No forms available
                                    </p>
                                    <p className="text-xs text-muted mt-1">
                                        Create a form first, then come back to complete it for this
                                        contact.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedForm && (
                <CompleteFormModal
                    formUuid={selectedForm.uuid}
                    contactUuid={contactUuid}
                    contactName={contactName ?? undefined}
                    isOpen={!!newCompleteFormUuid}
                    onOpenChange={(open) => {
                        if (!open) setNewCompleteFormUuid(null);
                    }}
                />
            )}
        </div>
    );
}
