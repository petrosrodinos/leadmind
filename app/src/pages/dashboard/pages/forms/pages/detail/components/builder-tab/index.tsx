import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DropResult,
} from "@hello-pangea/dnd";
import { useReorderFormFields } from "@/features/forms/hooks/use-form-fields";
import type { FormField } from "@/features/forms/interfaces/form.interface";
import { FieldCard } from "./field-card";
import { FieldFormModal } from "./field-form-modal";
import { FormPreview } from "./form-preview";

interface BuilderTabProps {
    formUuid: string;
    fields: FormField[];
}

export function BuilderTab({ formUuid, fields }: BuilderTabProps) {
    const [addOpen, setAddOpen] = useState(false);
    const reorder = useReorderFormFields(formUuid);

    const [localFields, setLocalFields] = useState<FormField[]>(fields);

    // Sync whenever server data changes (covers added/deleted fields AND property changes like enabled/required)
    useEffect(() => {
        setLocalFields(fields);
    }, [fields]);

    const localSorted = [...localFields].sort((a, b) => a.order_index - b.order_index);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const from = result.source.index;
        const to = result.destination.index;
        if (from === to) return;

        const reordered = [...localSorted];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        const withNewOrder = reordered.map((f, i) => ({ ...f, order_index: i * 10 }));
        setLocalFields(withNewOrder);

        reorder.mutate({
            fields: withNewOrder.map((f) => ({ uuid: f.uuid, order_index: f.order_index })),
        });
    };

    const displayFields = localSorted;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                        Fields ({displayFields.length})
                    </p>
                    <Button size="sm" variant="secondary" onPress={() => setAddOpen(true)}>
                        <Plus className="size-3.5" />
                        Add Field
                    </Button>
                </div>

                {displayFields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted rounded-xl border border-dashed border-border">
                        <p className="text-sm">No fields yet.</p>
                        <p className="text-xs mt-1">Click "Add Field" to start building your form.</p>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="form-fields">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col gap-2"
                                >
                                    {displayFields.map((field, index) => (
                                        <Draggable
                                            key={field.uuid}
                                            draggableId={field.uuid}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <FieldCard
                                                    ref={provided.innerRef}
                                                    formUuid={formUuid}
                                                    field={field}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    draggableProps={provided.draggableProps}
                                                />
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>

            <div className="lg:sticky lg:top-0">
                <FormPreview fields={displayFields} />
            </div>

            <FieldFormModal formUuid={formUuid} isOpen={addOpen} onOpenChange={setAddOpen} />
        </div>
    );
}
