import { FIELD_TYPES_DISPLAY_ONLY, FIELD_TYPES_WITH_OPTIONS } from "@/features/forms/interfaces/form.interface";
import type { FormField } from "@/features/forms/interfaces/form.interface";

interface FormPreviewProps {
    fields: FormField[];
}

function PreviewField({ field }: { field: FormField }) {
    const isDisplayOnly = FIELD_TYPES_DISPLAY_ONLY.includes(field.field_type);
    const hasOptions = FIELD_TYPES_WITH_OPTIONS.includes(field.field_type);
    const options = field.options ?? [];

    if (field.field_type === "SECTION_HEADER") {
        return (
            <div className="pt-2">
                <h3 className="text-sm font-semibold text-foreground">{field.label}</h3>
                <hr className="mt-1 border-border" />
            </div>
        );
    }

    if (field.field_type === "LABEL") {
        return <p className="text-sm text-muted">{field.label}</p>;
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground">
                {field.label}
                {field.required && <span className="ml-0.5 text-danger">*</span>}
            </label>

            {field.field_type === "TEXTAREA" && (
                <textarea
                    disabled
                    placeholder={field.placeholder ?? ""}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted resize-none cursor-not-allowed"
                />
            )}
            {(field.field_type === "TEXT_INPUT" ||
                field.field_type === "EMAIL_INPUT" ||
                field.field_type === "PHONE_INPUT" ||
                field.field_type === "NUMBER_INPUT" ||
                field.field_type === "DATE_INPUT") && (
                <input
                    disabled
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
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted cursor-not-allowed"
                />
            )}
            {field.field_type === "CHECKBOX" && (
                <label className="flex items-center gap-2 text-sm text-muted cursor-not-allowed">
                    <input type="checkbox" disabled className="rounded" />
                    {field.placeholder || field.label}
                </label>
            )}
            {field.field_type === "RADIO_GROUP" && (
                <div className="flex flex-col gap-1">
                    {options.length > 0 ? (
                        options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-sm text-muted cursor-not-allowed">
                                <input type="radio" disabled className="rounded-full" />
                                {opt}
                            </label>
                        ))
                    ) : (
                        <span className="text-xs text-muted italic">No options added</span>
                    )}
                </div>
            )}
            {field.field_type === "DROPDOWN" && (
                <select
                    disabled
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted cursor-not-allowed"
                >
                    <option value="">{field.placeholder || "Select…"}</option>
                    {options.map((opt) => (
                        <option key={opt}>{opt}</option>
                    ))}
                </select>
            )}
            {field.field_type === "MULTI_SELECT_DROPDOWN" && (
                <select
                    disabled
                    multiple
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-muted cursor-not-allowed"
                    size={Math.min(4, Math.max(2, options.length))}
                >
                    {options.length > 0 ? (
                        options.map((opt) => <option key={opt}>{opt}</option>)
                    ) : (
                        <option disabled>No options added</option>
                    )}
                </select>
            )}

            {!isDisplayOnly && !hasOptions && field.field_type !== "CHECKBOX" && field.help_text && (
                <p className="text-xs text-muted">{field.help_text}</p>
            )}
            {hasOptions && field.help_text && (
                <p className="text-xs text-muted">{field.help_text}</p>
            )}
        </div>
    );
}

export function FormPreview({ fields }: FormPreviewProps) {
    const visibleFields = [...fields]
        .filter((f) => f.enabled)
        .sort((a, b) => a.order_index - b.order_index);

    if (visibleFields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
                <p className="text-sm">No enabled fields yet.</p>
                <p className="text-xs mt-1">Add fields to see a live preview.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-surface">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Preview</p>
            {visibleFields.map((field) => (
                <PreviewField key={field.uuid} field={field} />
            ))}
        </div>
    );
}
