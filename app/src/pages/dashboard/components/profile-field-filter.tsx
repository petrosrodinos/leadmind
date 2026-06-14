import { Fragment } from "react";
import { Label, ListBox, Select, Switch } from "@heroui/react";
import { cn } from "@/lib/utils";
import {
    CONTACT_PROFILE_FIELD_OPTIONS,
    type ContactProfileField,
} from "@/features/contacts/constants/contact-profile-fields.constants";

interface ProfileFieldFilterProps {
    profileField: ContactProfileField | undefined;
    hasProfileField: boolean | undefined;
    onProfileFieldChange: (field: ContactProfileField | undefined) => void;
    onHasProfileFieldChange: (has: boolean | undefined) => void;
    disabled?: boolean;
    selectClassName?: string;
    presenceClassName?: string;
}

export function ProfileFieldFilter({
    profileField,
    hasProfileField,
    onProfileFieldChange,
    onHasProfileFieldChange,
    disabled,
    selectClassName,
    presenceClassName,
}: ProfileFieldFilterProps) {
    const hasValue = hasProfileField ?? true;

    return (
        <Fragment>
            <div className={cn(selectClassName)}>
                <Select
                    className="w-full"
                    placeholder="Any field"
                    value={profileField ?? null}
                    onChange={(v) => {
                        const id = v == null ? "" : String(v);
                        onProfileFieldChange(
                            id ? (id as ContactProfileField) : undefined,
                        );
                    }}
                    isDisabled={disabled}
                >
                    <Label>Profile field</Label>
                    <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            <ListBox.Item id="" textValue="Any field">
                                Any field
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                            {CONTACT_PROFILE_FIELD_OPTIONS.map((opt) => (
                                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                    {opt.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
                <p className="text-xs text-muted mt-1">
                    Filter contacts by whether they have email, phone, website, LinkedIn, or Google Maps.
                </p>
            </div>

            {profileField ? (
                <div className={cn(presenceClassName)}>
                    <label className="flex h-full min-h-[4.5rem] items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-secondary/20 px-3 py-2.5 cursor-pointer">
                        <div className="min-w-0">
                            <div className="text-sm text-foreground">Contact has this field</div>
                            <p className="text-xs text-muted">
                                {hasValue
                                    ? "Only contacts with a value for the selected field."
                                    : "Only contacts missing the selected field."}
                            </p>
                        </div>
                        <Switch
                            isSelected={hasValue}
                            onChange={(v) =>
                                onHasProfileFieldChange(typeof v === "boolean" ? v : !hasValue)
                            }
                            isDisabled={disabled}
                            aria-label="Contact has this field"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                    </label>
                </div>
            ) : null}
        </Fragment>
    );
}
