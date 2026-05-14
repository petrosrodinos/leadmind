import type { FC } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FieldError, Form, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
    useCreateScoringInstruction,
    useDeleteScoringInstruction,
    useScoringInstructions,
    useUpdateScoringInstruction,
} from "@/features/scoring-instructions/hooks/use-scoring-instructions";
import type { ScoringInstruction } from "@/features/scoring-instructions/interfaces/scoring-instruction.interface";
import {
    scoringInstructionFormSchema,
    type ScoringInstructionFormValues,
} from "@/features/scoring-instructions/validation-schemas/scoring-instruction.schema";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ScoringInstructionModal: FC<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initial: ScoringInstruction | null;
    onSaved: () => void;
}> = ({ isOpen, onOpenChange, initial, onSaved }) => {
    const createMut = useCreateScoringInstruction();
    const updateMut = useUpdateScoringInstruction();
    const form = useForm<ScoringInstructionFormValues>({
        resolver: zodResolver(scoringInstructionFormSchema),
        defaultValues: { name: "", instructions: "" },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: initial?.name ?? "",
                instructions: initial?.instructions ?? "",
            });
        }
    }, [isOpen, initial, form]);

    const onSubmit = form.handleSubmit(async (vals) => {
        if (initial) {
            await updateMut.mutateAsync({ uuid: initial.uuid, payload: vals });
        } else {
            await createMut.mutateAsync(vals);
        }
        onSaved();
        onOpenChange(false);
    });

    const pending = createMut.isPending || updateMut.isPending;

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{initial ? "Edit scoring instruction" : "New scoring instruction"}</Modal.Heading>
                    </Modal.Header>
                    <Form onSubmit={onSubmit} className="contents">
                        <Modal.Body className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="si-name">Name</Label>
                                <Input
                                    id="si-name"
                                    placeholder="e.g. ICP fit, buying intent"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="si-instructions">Instructions</Label>
                                <TextArea
                                    id="si-instructions"
                                    rows={8}
                                    placeholder="How should the model score this contact from 1–10? Be specific about signals, roles, and disqualifiers."
                                    {...form.register("instructions")}
                                />
                                {form.formState.errors.instructions && (
                                    <FieldError>{form.formState.errors.instructions.message}</FieldError>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="gap-2 justify-end">
                            <Button type="button" size="sm" variant="tertiary" onPress={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <ActionButtonWithPending type="submit" size="sm" isDisabled={pending} isPending={pending}>
                                {initial ? "Save" : "Create"}
                            </ActionButtonWithPending>
                        </Modal.Footer>
                    </Form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

const ScoringInstructionsPage: FC = () => {
    const { data: rows = [], isLoading, refetch } = useScoringInstructions();
    const deleteMut = useDeleteScoringInstruction();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ScoringInstruction | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ScoringInstruction | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Scoring instructions</h1>
                    <p className="text-sm text-muted">
                        Reusable prompts for AI scoring. Attach them to filters; each contact gets a score per instruction.
                    </p>
                </div>
                <Button
                    onPress={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    <Plus className="size-4" />
                    New instruction
                </Button>
            </div>

            {isLoading ? (
                <div className="h-40 rounded-xl bg-surface-secondary animate-pulse border border-border" />
            ) : rows.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted">
                    No scoring instructions yet. Create one to use on filters.
                </div>
            ) : (
                <ul className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
                    {rows.map((row) => (
                        <li key={row.uuid} className="flex flex-wrap items-start justify-between gap-3 p-4 hover:bg-surface-secondary/40">
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground">{row.name}</p>
                                <p className="text-xs text-muted line-clamp-2 mt-1 whitespace-pre-wrap">{row.instructions}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onPress={() => {
                                        setEditing(row);
                                        setModalOpen(true);
                                    }}
                                    aria-label="Edit"
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <Button size="sm" variant="tertiary" onPress={() => setDeleteTarget(row)} aria-label="Delete">
                                    <Trash2 className="size-4 text-danger" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ScoringInstructionModal
                isOpen={modalOpen}
                onOpenChange={setModalOpen}
                initial={editing}
                onSaved={() => void refetch()}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                title="Delete scoring instruction?"
                description="Contacts keep existing scores, but filters lose this link."
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteMut.isPending}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await deleteMut.mutateAsync(deleteTarget.uuid);
                    setDeleteTarget(null);
                    void refetch();
                }}
            />
        </div>
    );
};

export default ScoringInstructionsPage;
