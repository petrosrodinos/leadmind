import type { ReactNode } from "react";
import { Input, Label, ListBox, Select, Switch, TextField } from "@heroui/react";
import { CAMPAIGN_PROFILE_FIELD_OPTIONS } from "@/features/marketing-campaigns/constants/campaign-profile-fields.constants";
import type { CampaignFilters } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_OPTIONS } from "@/features/contacts/constants/contacts.constants";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useContactTags } from "@/features/contacts/hooks/use-contacts";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScoreRulesFilter } from "@/pages/dashboard/components/score-rules-filter";

interface AudienceFilterFormProps {
    value: CampaignFilters;
    onChange: (patch: Partial<CampaignFilters>) => void;
    disabled?: boolean;
}

export function AudienceFilterForm({
    value,
    onChange,
    disabled,
}: AudienceFilterFormProps) {
    const { data: filters, isLoading: filtersLoading } = useFilters();
    const { data: availableTags = [] } = useContactTags();

    return (
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
                        Restrict the audience to contacts sourced from a specific filter.
                    </p>
                </div>
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

                <div>
                    <Label>Profile field</Label>
                    <Select
                        aria-label="Profile field"
                        value={value.profile_field ?? ""}
                        onChange={(v) => {
                            if (typeof v !== "string") return;
                            if (v === "") {
                                onChange({
                                    profile_field: undefined,
                                    has_profile_field: undefined,
                                });
                                return;
                            }
                            onChange({
                                profile_field: v as CampaignFilters["profile_field"],
                                has_profile_field: value.has_profile_field ?? true,
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
                                <ListBox.Item id="" textValue="Any field">
                                    Any field
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                {CAMPAIGN_PROFILE_FIELD_OPTIONS.map((opt) => (
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

                {value.profile_field ? (
                    <SwitchRow
                        label="Contact has this field"
                        description={
                            value.has_profile_field ?? true
                                ? "Only contacts with a value for the selected field."
                                : "Only contacts missing the selected field."
                        }
                        checked={value.has_profile_field ?? true}
                        onChange={(checked) => onChange({ has_profile_field: checked })}
                        disabled={disabled}
                    />
                ) : null}
            </FilterSection>

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
        </div>
    );
}

interface FilterSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

function FilterSection({ title, description, children }: FilterSectionProps) {
    return (
        <section className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="border-b border-border/60 bg-surface-secondary/30 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description ? (
                    <p className="text-xs text-muted mt-0.5">{description}</p>
                ) : null}
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
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
