import { forwardRef, useState } from "react";
import { Button } from "@heroui/react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from "@hello-pangea/dnd";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteFormField, useUpdateFormField } from "@/features/forms/hooks/use-form-fields";
import { FIELD_TYPE_LABELS } from "@/features/forms/interfaces/form.interface";
import type { FormField } from "@/features/forms/interfaces/form.interface";
import { FieldFormModal } from "./field-form-modal";

interface FieldCardProps {
    formUuid: string;
    field: FormField;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    draggableProps?: DraggableProvidedDraggableProps;
}

export const FieldCard = forwardRef<HTMLDivElement, FieldCardProps>(
    ({ formUuid, field, dragHandleProps, draggableProps }, ref) => {
        const [editOpen, setEditOpen] = useState(false);
        const [deleteOpen, setDeleteOpen] = useState(false);
        const updateField = useUpdateFormField(formUuid);
        const deleteField = useDeleteFormField(formUuid);

        return (
            <div
                ref={ref}
                {...draggableProps}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 group"
            >
                <div
                    {...dragHandleProps}
                    className="cursor-grab text-muted hover:text-foreground transition-colors shrink-0"
                >
                    <GripVertical className="size-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                            {field.label}
                        </span>
                        {field.required && (
                            <span className="text-xs text-danger">Required</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted">
                            {FIELD_TYPE_LABELS[field.field_type]}
                        </span>
                        {!field.enabled && (
                            <span className="text-xs text-muted italic">disabled</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() =>
                            updateField.mutate({
                                fieldUuid: field.uuid,
                                payload: { enabled: !field.enabled },
                            })
                        }
                        isDisabled={updateField.isPending}
                        aria-label={field.enabled ? "Disable field" : "Enable field"}
                        className={field.enabled ? "text-muted" : "text-accent"}
                    >
                        {field.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => setEditOpen(true)}
                        aria-label="Edit field"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => setDeleteOpen(true)}
                        className="text-danger"
                        aria-label="Delete field"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>

                <FieldFormModal
                    formUuid={formUuid}
                    isOpen={editOpen}
                    onOpenChange={setEditOpen}
                    editing={field}
                />
                <ConfirmDialog
                    isOpen={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    title="Delete this field?"
                    description="Field values from previous completions will remain but will show as a deleted field."
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    variant="danger"
                    isPending={deleteField.isPending}
                    onConfirm={() =>
                        deleteField.mutate(field.uuid, { onSuccess: () => setDeleteOpen(false) })
                    }
                />
            </div>
        );
    },
);

FieldCard.displayName = "FieldCard";
