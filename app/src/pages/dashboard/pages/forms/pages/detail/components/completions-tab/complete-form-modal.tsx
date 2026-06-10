import { useEffect, useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Modal, Select, TextArea } from "@heroui/react";
import { ChevronDown, Filter, Search, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCreateFormCompletion } from "@/features/forms/hooks/use-form-completions";
import { useForm } from "@/features/forms/hooks/use-forms";
import { listContacts } from "@/features/contacts/services/contacts.service";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { FIELD_TYPES_DISPLAY_ONLY } from "@/features/forms/interfaces/form.interface";
import type { FormField } from "@/features/forms/interfaces/form.interface";
import type { FormCompletion } from "@/features/forms/interfaces/form-completion.interface";

interface ContactInfo {
    uuid: string;
    name: string | null;
    email: string | null;
    company: string | null;
}

interface CompleteFormModalProps {
    formUuid: string;
    fields?: FormField[];
    contactUuid?: string;
    contactName?: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingCompletion?: FormCompletion | null;
}

export function CompleteFormModal({
    formUuid,
    fields: fieldsProp,
    contactUuid,
    contactName,
    isOpen,
    onOpenChange,
    editingCompletion,
}: CompleteFormModalProps) {
    const createCompletion = useCreateFormCompletion(formUuid);

    // Fetch form detail (with fields) if not provided via props
    const { data: formDetail } = useForm(formUuid);
    const fields = fieldsProp && fieldsProp.length > 0 ? fieldsProp : (formDetail?.fields ?? []);
    const isPending = createCompletion.isPending;

    const [values, setValues] = useState<Record<string, string>>({});
    const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);
    const [selectedFilterUuid, setSelectedFilterUuid] = useState("");
    const [contactSearch, setContactSearch] = useState("");
    const debouncedSearch = useDebouncedValue(contactSearch, 300);

    const showContactSelector = !contactUuid && !editingCompletion;

    const { data: filters = [] } = useFilters();

    const contactQuery = {
        filter_uuid: selectedFilterUuid || undefined,
        search: debouncedSearch || undefined,
        limit: 50,
        page: 1,
    };
    const { data: contactsPage, isLoading: contactsLoading } = useQuery({
        queryKey: contactsQueryKeys.list(contactQuery),
        queryFn: () => listContacts(contactQuery),
        enabled: showContactSelector && !!selectedFilterUuid,
        staleTime: 30_000,
    });
    const contactResults = contactsPage?.data ?? [];

    const activeFields = [...fields]
        .filter((f) => f.enabled && !FIELD_TYPES_DISPLAY_ONLY.includes(f.field_type))
        .sort((a, b) => a.order_index - b.order_index);

    useEffect(() => {
        if (!isOpen) return;
        const initialValues: Record<string, string> = {};
        const initialMulti: Record<string, string[]> = {};
        activeFields.forEach((f) => {
            if (f.field_type === "MULTI_SELECT_DROPDOWN") {
                initialMulti[f.uuid] = [];
            } else if (f.field_type === "CHECKBOX") {
                initialValues[f.uuid] = "false";
            } else {
                initialValues[f.uuid] = f.default_value ?? "";
            }
        });
        if (editingCompletion) {
            editingCompletion.values.forEach((v) => {
                const field = fields.find((f) => f.uuid === v.field_uuid);
                if (!field) return;
                if (field.field_type === "MULTI_SELECT_DROPDOWN") {
                    try {
                        initialMulti[v.field_uuid] = JSON.parse(v.value);
                    } catch {
                        initialMulti[v.field_uuid] = [];
                    }
                } else {
                    initialValues[v.field_uuid] = v.value;
                }
            });
        }
        setValues(initialValues);
        setMultiValues(initialMulti);
        setErrors({});
        setSelectedContact(null);
        setSelectedFilterUuid("");
        setContactSearch("");
    }, [isOpen]);

    const resolvedContactUuid = contactUuid ?? selectedContact?.uuid;

    const validate = () => {
        const errs: Record<string, string> = {};
        activeFields.forEach((f) => {
            if (!f.required) return;
            if (f.field_type === "MULTI_SELECT_DROPDOWN") {
                if (!multiValues[f.uuid] || multiValues[f.uuid].length === 0) {
                    errs[f.uuid] = "This field is required";
                }
            } else if (f.field_type === "CHECKBOX") {
                // checkbox required means must be checked
            } else {
                if (!values[f.uuid]?.trim()) {
                    errs[f.uuid] = "This field is required";
                }
            }
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!resolvedContactUuid) return;
        if (!validate()) return;

        const completionValues = activeFields.map((f) => {
            if (f.field_type === "MULTI_SELECT_DROPDOWN") {
                return {
                    field_uuid: f.uuid,
                    value: JSON.stringify(multiValues[f.uuid] ?? []),
                };
            }
            return { field_uuid: f.uuid, value: values[f.uuid] ?? "" };
        });

        createCompletion.mutate(
            { contact_uuid: resolvedContactUuid, values: completionValues },
            { onSuccess: () => onOpenChange(false) },
        );
    };

    const setValue = (fieldUuid: string, val: string) => {
        setValues((prev) => ({ ...prev, [fieldUuid]: val }));
        if (errors[fieldUuid]) setErrors((prev) => ({ ...prev, [fieldUuid]: "" }));
    };

    const toggleMultiOption = (fieldUuid: string, opt: string) => {
        setMultiValues((prev) => {
            const cur = prev[fieldUuid] ?? [];
            const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
            return { ...prev, [fieldUuid]: next };
        });
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Complete Form</Modal.Heading>
                        {(contactUuid || selectedContact) && (
                            <p className="text-sm text-muted mt-0.5">
                                {contactName ?? selectedContact?.name ?? selectedContact?.email ?? ""}
                            </p>
                        )}
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                        {showContactSelector && (
                            <div className="flex flex-col gap-2">
                                <Label>
                                    Contact <span className="text-red-500">*</span>
                                </Label>
                                {selectedContact ? (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <User className="size-3.5 text-muted shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {selectedContact.name ?? selectedContact.email ?? "Contact"}
                                                </p>
                                                {selectedContact.company && (
                                                    <p className="text-xs text-muted truncate">{selectedContact.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="tertiary"
                                            className="text-xs shrink-0"
                                            onPress={() => {
                                                setSelectedContact(null);
                                                setContactSearch("");
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Select
                                            aria-label="Select a filter"
                                            placeholder="Select a filter list…"
                                            value={selectedFilterUuid}
                                            onChange={(v) => {
                                                setSelectedFilterUuid((v as string) ?? "");
                                                setContactSearch("");
                                            }}
                                        >
                                            <Select.Trigger className="w-full">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <Filter className="size-3.5 text-muted shrink-0" />
                                                    <Select.Value />
                                                </span>
                                                <Select.Indicator>
                                                    <ChevronDown className="size-3.5" />
                                                </Select.Indicator>
                                            </Select.Trigger>
                                            <Select.Popover>
                                                <ListBox>
                                                    {filters.map((f) => (
                                                        <ListBox.Item key={f.uuid} id={f.uuid} textValue={f.name}>
                                                            {f.name}
                                                            <ListBox.ItemIndicator />
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>

                                        {selectedFilterUuid && (
                                            <div className="relative">
                                                <Search className="size-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                <Input
                                                    className="pl-9"
                                                    placeholder="Search contacts…"
                                                    value={contactSearch}
                                                    onChange={(e) => setContactSearch(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {selectedFilterUuid && (
                                            <div className="rounded-lg border border-border overflow-hidden max-h-40 overflow-y-auto">
                                                {contactsLoading ? (
                                                    <div className="py-4 text-center text-xs text-muted">
                                                        Loading…
                                                    </div>
                                                ) : contactResults.length === 0 ? (
                                                    <div className="py-4 text-center text-xs text-muted">
                                                        No contacts found.
                                                    </div>
                                                ) : (
                                                    contactResults.map((c) => (
                                                        <button
                                                            key={c.uuid}
                                                            type="button"
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-secondary transition-colors"
                                                            onClick={() =>
                                                                setSelectedContact({
                                                                    uuid: c.uuid,
                                                                    name: c.name ?? null,
                                                                    email: c.email ?? null,
                                                                    company: c.company ?? null,
                                                                })
                                                            }
                                                        >
                                                            <User className="size-3.5 text-muted shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {c.name ?? c.email ?? "Contact"}
                                                                </p>
                                                                {c.company && (
                                                                    <p className="text-xs text-muted truncate">
                                                                        {c.company}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeFields.map((field) => (
                            <div key={field.uuid} className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-foreground">
                                    {field.label}
                                    {field.required && (
                                        <span className="ml-0.5 text-danger">*</span>
                                    )}
                                </label>

                                {field.field_type === "TEXTAREA" && (
                                    <TextArea
                                        placeholder={field.placeholder ?? ""}
                                        value={values[field.uuid] ?? ""}
                                        onChange={(e) => setValue(field.uuid, e.target.value)}
                                        rows={3}
                                    />
                                )}
                                {(field.field_type === "TEXT_INPUT" ||
                                    field.field_type === "EMAIL_INPUT" ||
                                    field.field_type === "PHONE_INPUT" ||
                                    field.field_type === "NUMBER_INPUT" ||
                                    field.field_type === "DATE_INPUT") && (
                                    <Input
                                        type={
                                            field.field_type === "EMAIL_INPUT"
                                                ? "email"
                                                : field.field_type === "PHONE_INPUT"
                                                  ? "tel"
                                                  : field.field_type === "NUMBER_INPUT"
                                                    ? "number"
                                                    : field.field_type === "DATE_INPUT"
                                                      ? "date"
                                                      : "text"
                                        }
                                        placeholder={field.placeholder ?? ""}
                                        value={values[field.uuid] ?? ""}
                                        onChange={(e) => setValue(field.uuid, e.target.value)}
                                    />
                                )}
                                {field.field_type === "CHECKBOX" && (
                                    <Checkbox
                                        isSelected={values[field.uuid] === "true"}
                                        onChange={(checked) =>
                                            setValue(field.uuid, String(checked))
                                        }
                                    >
                                        {field.placeholder || field.label}
                                    </Checkbox>
                                )}
                                {field.field_type === "RADIO_GROUP" && (
                                    <div className="flex flex-col gap-1">
                                        {(field.options ?? []).map((opt) => (
                                            <label
                                                key={opt}
                                                className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name={field.uuid}
                                                    value={opt}
                                                    checked={values[field.uuid] === opt}
                                                    onChange={() => setValue(field.uuid, opt)}
                                                    className="rounded-full"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {field.field_type === "DROPDOWN" && (
                                    <select
                                        value={values[field.uuid] ?? ""}
                                        onChange={(e) => setValue(field.uuid, e.target.value)}
                                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="">{field.placeholder || "Select…"}</option>
                                        {(field.options ?? []).map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {field.field_type === "MULTI_SELECT_DROPDOWN" && (
                                    <div className="flex flex-col gap-1">
                                        {(field.options ?? []).map((opt) => (
                                            <label
                                                key={opt}
                                                className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(multiValues[field.uuid] ?? []).includes(opt)}
                                                    onChange={() => toggleMultiOption(field.uuid, opt)}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {field.help_text && (
                                    <p className="text-xs text-muted">{field.help_text}</p>
                                )}
                                {errors[field.uuid] && (
                                    <p className="text-xs text-danger">{errors[field.uuid]}</p>
                                )}
                            </div>
                        ))}

                        {activeFields.length === 0 && (
                            <p className="text-sm text-muted text-center py-4">
                                This form has no fillable fields yet.
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            isPending={isPending}
                            isDisabled={!resolvedContactUuid || isPending}
                            onPress={handleSubmit}
                        >
                            Submit
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
