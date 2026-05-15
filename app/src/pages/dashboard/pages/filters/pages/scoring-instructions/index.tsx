import type { FC } from "react";
import { useState } from "react";
import { Button } from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
    useDeleteScoringInstruction,
    useScoringInstructions,
} from "@/features/scoring-instructions/hooks/use-scoring-instructions";
import type { ScoringInstruction } from "@/features/scoring-instructions/interfaces/scoring-instruction.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ScoringInstructionModal } from "@/pages/dashboard/pages/filters/components/scoring-instruction-modal";

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
