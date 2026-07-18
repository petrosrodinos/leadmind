import { useState, type ReactNode } from "react";
import { Button, Input, Label, ListBox, Select, Switch, TextField } from "@heroui/react";
import { ChevronDown, Filter } from "lucide-react";
import type {
    ContactFilters,
    ContactFiltersFormSections,
} from "@/interfaces/contact-filters.interface";
import { ProfileFieldFilter } from "@/pages/dashboard/components/profile-field-filter";
import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useContactTags } from "@/features/contacts/hooks/use-contacts";
import { useContactLists } from "@/features/contact-lists/hooks/use-contact-lists";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScoreRulesFilter } from "@/pages/dashboard/components/score-rules-filter";
import { SOURCE_OPTIONS } from "@/features/filters/constants/source-options";
import type { SourceType } from "@/features/leads/interfaces/lead.interface";
import { cn } from "@/lib/utils";

interface ContactFiltersFormProps {
    value: ContactFilters & { contact_list_uuid?: string };
    onChange: (patch: Partial<ContactFilters & { contact_list_uuid?: string }>) => void;
    disabled?: boolean;
    sections?: ContactFiltersFormSections;
    showSourceFilter?: boolean;
    showLeadSourceType?: boolean;
    showContactListFilter?: boolean;
    collapsible?: boolean;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    collapsibleLabel?: string;
}

const DEFAULT_SECTIONS: Required<ContactFiltersFormSections> = {
    engagement: false,
    outreach: false,
};

export function ContactFiltersForm({
    value,
    onChange,
    disabled,
    sections: sectionsProp,
    showSourceFilter = true,
    showLeadSourceType = false,
    showContactListFilter = false,
    collapsible = false,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    collapsibleLabel = "Contact filters",
}: ContactFiltersFormProps) {
    const sections = { ...DEFAULT_SECTIONS, ...sectionsProp };
    const { data: filters, isLoading: filtersLoading } = useFilters();
    const { data: availableTags = [] } = useContactTags();
    const { data: contactListsPage, isLoading: contactListsLoading } = useContactLists(
        { limit: 100 },
        showContactListFilter,
    );
    const contactLists = contactListsPage?.data ?? [];
    const contactListUuid = value.contact_list_uuid;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const panelOpen = isControlled ? openProp : uncontrolledOpen;

    const setPanelOpen = (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
    };

    const form = (
        <div className="flex flex-col gap-4">
            <FilterSection
                title="Find contacts"
                description="Narrow the audience by keyword or lead source."
            >
                <TextField name="search" className="w-full">
                    <Label>Search</Label>
                    <Input
                        placeholder="Name, email, company"
                        value={value.search ?? ""}
                        onChange={(e) =>
                            onChange({ search: e.target.value || undefined })
                        }
                        disabled={disabled}
                    />
                </TextField>

                {showSourceFilter ? (
                <div>
                    <Label>Source filter</Label>
                    <Select
                        aria-label="Source filter"
                        value={value.filter_uuid ?? ""}
                        onChange={(v) => {
                            if (typeof v !== "string") return;
                            onChange({ filter_uuid: v === "" ? undefined : v });
                        }}
                        isDisabled={disabled || filtersLoading}
                    >
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item id="" textValue="Any filter">
                                    Any filter
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                {(filters ?? []).map((f) => (
                                    <ListBox.Item key={f.uuid} id={f.uuid} textValue={f.name}>
                                        {f.name}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <p className="text-xs text-muted mt-1">
                        Restrict to contacts linked to a specific filter (primary source or also found by).
                    </p>
                </div>
                ) : null}

                {showContactListFilter ? (
                    <div>
                        <Label>Contact list</Label>
                        <Select
                            aria-label="Contact list"
                            value={contactListUuid ?? ""}
                            onChange={(v) => {
                                if (typeof v !== "string") return;
                                onChange({
                                    contact_list_uuid: v === "" ? undefined : v,
                                });
                            }}
                            isDisabled={disabled || contactListsLoading}
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    <ListBox.Item id="" textValue="Any list">
                                        Any list
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    {contactLists.map((list) => (
                                        <ListBox.Item
                                            key={list.uuid}
                                            id={list.uuid}
                                            textValue={list.title}
                                        >
                                            {list.title}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                        <p className="text-xs text-muted mt-1">
                            Only include contacts that belong to the selected list.
                        </p>
                    </div>
                ) : null}

                {showLeadSourceType ? (
                    <div>
                        <Label>Lead source</Label>
                        <Select
                            aria-label="Lead source"
                            value={value.source_type ?? ""}
                            onChange={(v) => {
                                if (typeof v !== "string") return;
                                onChange({
                                    source_type: v === "" ? undefined : (v as SourceType),
                                });
                            }}
                            isDisabled={disabled}
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    <ListBox.Item id="" textValue="Any source">
                                        Any source
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    {SOURCE_OPTIONS.map((opt) => (
                                        <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                            {opt.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>
                ) : null}
            </FilterSection>

            <FilterSection
                title="Contact criteria"
                description="Filter by CRM status, tags, and score thresholds."
            >
                <div>
                    <Label>Status</Label>
                    <Select
                        aria-label="Status"
                        value={value.status ?? ""}
                        onChange={(v) => {
                            if (typeof v !== "string") return;
                            onChange({
                                status: v === "" ? undefined : (v as LeadStatus),
                            });
                        }}
                        isDisabled={disabled}
                    >
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item id="" textValue="Any status">
                                    Any status
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                {STATUS_OPTIONS.map((opt) => (
                                    <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                        {opt.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>

                <div>
                    <Label className="mb-1 block">Tags</Label>
                    <MultiSelect
                        options={availableTags}
                        value={value.tags ?? []}
                        onChange={(next: string[]) => onChange({ tags: next.length ? next : undefined })}
                        placeholder="Any tags"
                        disabled={disabled}
                        aria-label="Filter by tags"
                    />
                </div>

                <div className="sm:col-span-2">
                    <ScoreRulesFilter
                        value={value.score_rules ?? []}
                        onChange={(next) =>
                            onChange({ score_rules: next.length > 0 ? next : undefined })
                        }
                        disabled={disabled}
                    />
                </div>

                <ProfileFieldFilter
                    profileField={value.profile_field}
                    hasProfileField={value.has_profile_field}
                    onProfileFieldChange={(field) =>
                        onChange({
                            profile_field: field,
                            has_profile_field: field ? (value.has_profile_field ?? true) : undefined,
                        })
                    }
                    onHasProfileFieldChange={(has) => onChange({ has_profile_field: has })}
                    disabled={disabled}
                />
            </FilterSection>

            {sections.engagement ? (
                <FilterSection
                    title="Engagement history"
                    description="Limit contacts by when they last interacted with you."
                >
                    <TextField name="last_after" className="w-full">
                        <Label>Last interaction after</Label>
                        <Input
                            type="date"
                            value={
                                value.last_interaction_after
                                    ? value.last_interaction_after.slice(0, 10)
                                    : ""
                            }
                            onChange={(e) =>
                                onChange({
                                    last_interaction_after: e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : undefined,
                                })
                            }
                            disabled={disabled}
                        />
                    </TextField>

                    <TextField name="last_before" className="w-full">
                        <Label>Last interaction before</Label>
                        <Input
                            type="date"
                            value={
                                value.last_interaction_before
                                    ? value.last_interaction_before.slice(0, 10)
                                    : ""
                            }
                            onChange={(e) =>
                                onChange({
                                    last_interaction_before: e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : undefined,
                                })
                            }
                            disabled={disabled}
                        />
                    </TextField>
                </FilterSection>
            ) : null}

            {sections.outreach ? (
                <FilterSection
                    title="Outreach rules"
                    description="Control who is eligible based on past campaign activity."
                >
                    <SwitchRow
                        label="Never contacted"
                        description="Only include contacts who have never been sent an email or SMS campaign."
                        checked={!!value.never_contacted}
                        onChange={(checked) =>
                            onChange({ never_contacted: checked || undefined })
                        }
                        disabled={disabled}
                    />

                    <SwitchRow
                        label="Include unsubscribed"
                        description="Off by default — keeps unsubscribed contacts safe."
                        checked={!!value.include_unsubscribed}
                        onChange={(checked) =>
                            onChange({ include_unsubscribed: checked || undefined })
                        }
                        disabled={disabled}
                    />
                </FilterSection>
            ) : null}
        </div>
    );

    if (!collapsible) return form;

    return (
        <div className="flex flex-col gap-4">
            <Button
                size="sm"
                variant="tertiary"
                className="self-start"
                onPress={() => setPanelOpen(!panelOpen)}
            >
                <Filter className="size-4" />
                {collapsibleLabel}
                <ChevronDown
                    className={cn("size-4 transition-transform", panelOpen && "rotate-180")}
                />
            </Button>
            {panelOpen ? (
                <div className="rounded-xl border border-border bg-surface p-4">{form}</div>
            ) : null}
        </div>
    );
}

interface FilterSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

function FilterSection({ title, description, children }: FilterSectionProps) {
    const [open, setOpen] = useState(false);

    return (
        <section className="rounded-xl border border-border bg-surface overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 border-b border-border/60 bg-surface-secondary/30 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    {description ? (
                        <p className="text-xs text-muted mt-0.5">{description}</p>
                    ) : null}
                </div>
                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 text-muted transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>
            {open ? (
                <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
            ) : null}
        </section>
    );
}

interface SwitchRowProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function SwitchRow({ label, description, checked, onChange, disabled }: SwitchRowProps) {
    return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-secondary/20 px-3 py-2.5 cursor-pointer">
            <div className="min-w-0">
                <div className="text-sm text-foreground">{label}</div>
                <p className="text-xs text-muted">{description}</p>
            </div>
            <Switch
                isSelected={checked}
                onChange={(v) => onChange(typeof v === "boolean" ? v : !checked)}
                isDisabled={disabled}
                aria-label={label}
            >
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
            </Switch>
        </label>
    );
}
