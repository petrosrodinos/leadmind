import { useState } from "react";
import { Button, Modal, TextArea, Input } from "@heroui/react";
import { Pencil } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useUpdateFormCompletion } from "@/features/forms/hooks/use-form-completions";
import type { FormCompletion } from "@/features/forms/interfaces/form-completion.interface";
import type { FormField } from "@/features/forms/interfaces/form.interface";

function formatDate(d: string) {
    return new Date(d).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function renderValue(value: string, fieldType: string): string {
    if (fieldType === "CHECKBOX") return value === "true" ? "Yes" : "No";
    if (fieldType === "MULTI_SELECT_DROPDOWN") {
        try {
            const arr = JSON.parse(value) as string[];
            return arr.join(", ") || "—";
        } catch {
            return value || "—";
        }
    }
    return value || "—";
}

interface CompletionViewModalProps {
    formUuid: string;
    completion: FormCompletion;
    fields: FormField[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompletionViewModal({
    formUuid,
    completion,
    fields,
    isOpen,
    onOpenChange,
}: CompletionViewModalProps) {
    const [editMode, setEditMode] = useState(false);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const updateCompletion = useUpdateFormCompletion(formUuid);

    const handleEditStart = () => {
        const init: Record<string, string> = {};
        completion.values.forEach((v) => {
            init[v.field_uuid] = v.value;
        });
        setEditValues(init);
        setEditMode(true);
    };

    const handleSave = () => {
        const values = Object.entries(editValues).map(([field_uuid, value]) => ({
            field_uuid,
            value,
        }));
        updateCompletion.mutate(
            { completionUuid: completion.uuid, payload: { values } },
            {
                onSuccess: () => {
                    setEditMode(false);
                    onOpenChange(false);
                },
            },
        );
    };

    const contact = completion.contact;
    const contactLabel =
        contact.name ?? contact.email ?? contact.company ?? "Unknown Contact";

    const sortedValues = [...completion.values].sort((a, b) => {
        const fa = fields.find((f) => f.uuid === a.field_uuid);
        const fb = fields.find((f) => f.uuid === b.field_uuid);
        return (fa?.order_index ?? 0) - (fb?.order_index ?? 0);
    });

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Completion</Modal.Heading>
                        <p className="text-sm text-muted mt-0.5">
                            {contactLabel} — {formatDate(completion.created_at)}
                        </p>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                        {sortedValues.map((v) => {
                            const field = v.field ?? fields.find((f) => f.uuid === v.field_uuid);
                            const label = field?.label ?? "(deleted field)";
                            const fieldType = field?.field_type ?? "TEXT_INPUT";

                            if (editMode) {
                                return (
                                    <div key={v.uuid} className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-foreground">
                                            {label}
                                        </label>
                                        {fieldType === "TEXTAREA" ? (
                                            <TextArea
                                                value={editValues[v.field_uuid] ?? ""}
                                                onChange={(e) =>
                                                    setEditValues((prev) => ({
                                                        ...prev,
                                                        [v.field_uuid]: e.target.value,
                                                    }))
                                                }
                                                rows={3}
                                            />
                                        ) : (
                                            <Input
                                                value={editValues[v.field_uuid] ?? ""}
                                                onChange={(e) =>
                                                    setEditValues((prev) => ({
                                                        ...prev,
                                                        [v.field_uuid]: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div key={v.uuid} className="flex flex-col gap-0.5">
                                    <p className="text-xs font-medium text-muted">{label}</p>
                                    <p className="text-sm text-foreground">
                                        {renderValue(v.value, fieldType)}
                                    </p>
                                </div>
                            );
                        })}

                        {sortedValues.length === 0 && (
                            <p className="text-sm text-muted text-center py-4">
                                No values recorded.
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-between">
                        <div>
                            {!editMode && (
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onPress={handleEditStart}
                                >
                                    <Pencil className="size-3.5" />
                                    Edit
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {editMode ? (
                                <>
                                    <Button
                                        variant="tertiary"
                                        onPress={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <ActionButtonWithPending
                                        isPending={updateCompletion.isPending}
                                        onPress={handleSave}
                                    >
                                        Save
                                    </ActionButtonWithPending>
                                </>
                            ) : (
                                <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                                    Close
                                </Button>
                            )}
                        </div>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
