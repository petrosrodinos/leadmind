import { Input, Label, ListBox, Select, Switch, TextField } from "@heroui/react";
import type { CampaignFilters } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useContactTags } from "@/features/contacts/hooks/use-contacts";
import { MultiSelect } from "@/components/ui/multi-select";

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
        <div className="grid gap-4 sm:grid-cols-2">
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
                            {Object.values(LeadStatus).map((s) => (
                                <ListBox.Item key={s} id={s} textValue={s}>
                                    {s}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>

            <TextField name="min_score" className="w-full">
                <Label>Minimum score (1-10)</Label>
                <Input
                    type="number"
                    min={1}
                    max={10}
                    value={value.min_score ?? ""}
                    onChange={(e) => {
                        const n = Number(e.target.value);
                        onChange({
                            min_score: Number.isFinite(n) && n > 0 ? n : undefined,
                        });
                    }}
                    disabled={disabled}
                />
            </TextField>

            <div>
                <Label className="mb-1 block">Tags</Label>
                <MultiSelect
                    options={availableTags}
                    value={value.tags ?? []}
                    onChange={(next) => onChange({ tags: next.length ? next : undefined })}
                    placeholder="Any tags"
                    disabled={disabled}
                    aria-label="Filter by tags"
                />
            </div>

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

            <SwitchRow
                label="Only with email"
                description="For email channel deliverability"
                checked={!!value.has_email}
                onChange={(checked) => onChange({ has_email: checked || undefined })}
                disabled={disabled}
            />

            <SwitchRow
                label="Only with phone"
                description="For SMS channel deliverability"
                checked={!!value.has_phone}
                onChange={(checked) => onChange({ has_phone: checked || undefined })}
                disabled={disabled}
            />

            <div className="sm:col-span-2">
                <SwitchRow
                    label="Include unsubscribed"
                    description="Off by default — keeps unsubscribed contacts safe."
                    checked={!!value.include_unsubscribed}
                    onChange={(checked) =>
                        onChange({ include_unsubscribed: checked || undefined })
                    }
                    disabled={disabled}
                />
            </div>
        </div>
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
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary/30 px-3 py-2 cursor-pointer">
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
