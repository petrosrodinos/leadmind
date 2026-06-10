import { useEffect, useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Modal, Select, TextArea } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCreateFormField, useUpdateFormField } from "@/features/forms/hooks/use-form-fields";
import {
    FIELD_TYPE_LABELS,
    FIELD_TYPES_DISPLAY_ONLY,
    FIELD_TYPES_WITH_OPTIONS,
} from "@/features/forms/interfaces/form.interface";
import type { FieldType, FormField } from "@/features/forms/interfaces/form.interface";

const ALL_FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldType[];

interface FieldFormModalProps {
    formUuid: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editing?: FormField | null;
}

export function FieldFormModal({ formUuid, isOpen, onOpenChange, editing }: FieldFormModalProps) {
    const createField = useCreateFormField(formUuid);
    const updateField = useUpdateFormField(formUuid);
    const isPending = createField.isPending || updateField.isPending;

    const [label, setLabel] = useState("");
    const [fieldType, setFieldType] = useState<FieldType>("TEXT_INPUT");
    const [placeholder, setPlaceholder] = useState("");
    const [helpText, setHelpText] = useState("");
    const [required, setRequired] = useState(false);
    const [defaultValue, setDefaultValue] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [options, setOptions] = useState<string[]>([""]);

    const isDisplayOnly = FIELD_TYPES_DISPLAY_ONLY.includes(fieldType);
    const hasOptions = FIELD_TYPES_WITH_OPTIONS.includes(fieldType);

    useEffect(() => {
        if (!isOpen) return;
        if (editing) {
            setLabel(editing.label);
            setFieldType(editing.field_type);
            setPlaceholder(editing.placeholder ?? "");
            setHelpText(editing.help_text ?? "");
            setRequired(editing.required);
            setDefaultValue(editing.default_value ?? "");
            setEnabled(editing.enabled);
            setOptions(editing.options && editing.options.length > 0 ? editing.options : [""]);
        } else {
            setLabel("");
            setFieldType("TEXT_INPUT");
            setPlaceholder("");
            setHelpText("");
            setRequired(false);
            setDefaultValue("");
            setEnabled(true);
            setOptions([""]);
        }
    }, [isOpen, editing]);

    const handleConfirm = () => {
        const cleanedOptions = options.filter((o) => o.trim() !== "");
        const payload = {
            label: label.trim(),
            field_type: fieldType,
            placeholder: placeholder.trim() || undefined,
            help_text: helpText.trim() || undefined,
            required: isDisplayOnly ? false : required,
            default_value: defaultValue.trim() || undefined,
            enabled,
            options: hasOptions ? cleanedOptions : undefined,
        };

        if (editing) {
            updateField.mutate(
                { fieldUuid: editing.uuid, payload },
                { onSuccess: () => onOpenChange(false) },
            );
        } else {
            createField.mutate(payload, { onSuccess: () => onOpenChange(false) });
        }
    };

    const addOption = () => setOptions((prev) => [...prev, ""]);
    const updateOption = (i: number, val: string) =>
        setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
    const removeOption = (i: number) =>
        setOptions((prev) => prev.filter((_, idx) => idx !== i));

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{editing ? "Edit Field" : "Add Field"}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="field-label">
                                Label <span className="text-danger">*</span>
                            </Label>
                            <Input
                                id="field-label"
                                placeholder="e.g. Company Size"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Field Type</Label>
                            <Select
                                value={fieldType}
                                onChange={(v) => setFieldType(v as FieldType)}
                            >
                                <Select.Trigger>
                                    <Select.Value placeholder="Select type" />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        {ALL_FIELD_TYPES.map((ft) => (
                                            <ListBox.Item key={ft} id={ft} textValue={FIELD_TYPE_LABELS[ft]}>
                                                {FIELD_TYPE_LABELS[ft]}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        </div>

                        {!isDisplayOnly && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="field-placeholder">Placeholder</Label>
                                <Input
                                    id="field-placeholder"
                                    placeholder="Placeholder text shown in the field"
                                    value={placeholder}
                                    onChange={(e) => setPlaceholder(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="field-help-text">Help Text</Label>
                            <Input
                                id="field-help-text"
                                placeholder="Optional guidance text shown below the field"
                                value={helpText}
                                onChange={(e) => setHelpText(e.target.value)}
                            />
                        </div>

                        {!isDisplayOnly && (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="field-default-value">Default Value</Label>
                                    <Input
                                        id="field-default-value"
                                        placeholder="Pre-filled value"
                                        value={defaultValue}
                                        onChange={(e) => setDefaultValue(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <p className="text-xs font-medium text-foreground">Validation</p>
                                    <Checkbox
                                        isSelected={required}
                                        onChange={(checked: boolean) => setRequired(checked)}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <span className="text-sm">Required</span>
                                    </Checkbox>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <p className="text-xs font-medium text-foreground">Visibility</p>
                            <Checkbox
                                isSelected={enabled}
                                onChange={(checked: boolean) => setEnabled(checked)}
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <span className="text-sm">Enabled</span>
                            </Checkbox>
                        </div>

                        {hasOptions && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-foreground">Options</p>
                                {options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Input
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={(e) => updateOption(i, e.target.value)}
                                            className="flex-1"
                                        />
                                        {options.length > 1 && (
                                            <Button
                                                size="sm"
                                                variant="tertiary"
                                                onPress={() => removeOption(i)}
                                                className="text-danger shrink-0"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onPress={addOption}
                                    className="self-start"
                                >
                                    <Plus className="size-3.5" />
                                    Add Option
                                </Button>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            isPending={isPending}
                            isDisabled={!label.trim() || isPending}
                            onPress={handleConfirm}
                        >
                            {editing ? "Save" : "Add Field"}
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
