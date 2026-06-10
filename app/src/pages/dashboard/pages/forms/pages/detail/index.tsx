import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Tabs } from "@heroui/react";
import { ArrowLeft, ClipboardList, Copy, Pencil, Trash2 } from "lucide-react";
import { useDeleteForm, useDuplicateForm, useForm } from "@/features/forms/hooks/use-forms";
import { useFormWebSocket } from "@/features/forms/hooks/use-form-websocket";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Routes } from "@/routes/routes";
import { FORM_DETAIL_TABS } from "./constants/detail-tabs";
import { BuilderTab } from "./components/builder-tab";
import { CompletionsTab } from "./components/completions-tab";
import { FormFormModal } from "../../components/form-form-modal";

export default function FormDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();

    useFormWebSocket();

    const { data: form, isLoading } = useForm(uuid!);
    const deleteForm = useDeleteForm();
    const duplicateForm = useDuplicateForm();

    const [activeTab, setActiveTab] = useState<string>("builder");
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = () => {
        if (!form) return;
        deleteForm.mutate(form.uuid, {
            onSuccess: () => {
                setDeleteOpen(false);
                navigate(Routes.dashboard.forms);
            },
        });
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => navigate(Routes.dashboard.forms)}
                        aria-label="Back to forms"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="size-4 text-muted" />
                            {isLoading ? (
                                <div className="h-6 w-48 rounded bg-surface-secondary animate-pulse" />
                            ) : (
                                <h1 className="text-xl font-semibold text-foreground">
                                    {form?.name ?? "Form"}
                                </h1>
                            )}
                        </div>
                        {form?.description && (
                            <p className="text-sm text-muted ml-6">{form.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => form && duplicateForm.mutate(form.uuid)}
                        isDisabled={!form || duplicateForm.isPending}
                        aria-label="Duplicate form"
                    >
                        <Copy className="size-3.5" />
                        Duplicate
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => setEditOpen(true)}
                        isDisabled={!form}
                        aria-label="Edit form"
                    >
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => setDeleteOpen(true)}
                        isDisabled={!form}
                        className="text-danger"
                        aria-label="Delete form"
                    >
                        <Trash2 className="size-3.5" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
                <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border overflow-x-auto max-w-full">
                    {FORM_DETAIL_TABS.map((t) => (
                        <Tabs.Tab
                            key={t.id}
                            id={t.id}
                            className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
                        >
                            {t.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            {/* Tab content */}
            <div>
                {isLoading || !form ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-14 rounded-xl bg-surface-secondary animate-pulse"
                            />
                        ))}
                    </div>
                ) : activeTab === "builder" ? (
                    <BuilderTab formUuid={form.uuid} fields={form.fields ?? []} />
                ) : activeTab === "completions" ? (
                    <CompletionsTab formUuid={form.uuid} fields={form.fields ?? []} />
                ) : null}
            </div>

            {form && (
                <>
                    <FormFormModal isOpen={editOpen} onOpenChange={setEditOpen} editing={form} />
                    <ConfirmDialog
                        isOpen={deleteOpen}
                        onOpenChange={setDeleteOpen}
                        title="Delete this form?"
                        description="All fields and completions will be permanently deleted. This cannot be undone."
                        confirmLabel="Delete"
                        cancelLabel="Cancel"
                        variant="danger"
                        isPending={deleteForm.isPending}
                        onConfirm={handleDelete}
                    />
                </>
            )}
        </div>
    );
}
