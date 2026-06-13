import { useState } from "react";
import { Button, ListBox, Select } from "@heroui/react";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import { ContactFiltersForm } from "../contact-filters-form";

export type DateRangePreset = "7d" | "30d" | "90d" | "all";

const PRESET_OPTIONS: { id: DateRangePreset; label: string }[] = [
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "Last 90 days" },
    { id: "all", label: "All time" },
];

export function dateRangeFromPreset(preset: DateRangePreset): { from?: string; to?: string } {
    if (preset === "all") return {};
    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
}

interface AudienceStatsFiltersBarProps {
    preset: DateRangePreset;
    onPresetChange: (preset: DateRangePreset) => void;
    contactFilters: ContactFilters;
    onContactFiltersChange: (patch: Partial<ContactFilters>) => void;
    showSourceFilter?: boolean;
}

export function AudienceStatsFiltersBar({
    preset,
    onPresetChange,
    contactFilters,
    onContactFiltersChange,
    showSourceFilter = true,
}: AudienceStatsFiltersBarProps) {
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                    <span className="text-xs text-muted">Activity period</span>
                    <Select
                        aria-label="Activity period"
                        value={preset}
                        onChange={(v) => {
                            if (typeof v !== "string") return;
                            onPresetChange(v as DateRangePreset);
                        }}
                    >
                        <Select.Trigger className="h-9">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {PRESET_OPTIONS.map((opt) => (
                                    <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                        {opt.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
                <Button
                    size="sm"
                    variant="tertiary"
                    className="mt-5"
                    onPress={() => setFiltersOpen((v) => !v)}
                >
                    <Filter className="size-4" />
                    Contact filters
                    <ChevronDown className={cn("size-4 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
            </div>
            {filtersOpen ? (
                <div className="rounded-xl border border-border bg-surface p-4">
                    <ContactFiltersForm
                        value={contactFilters}
                        onChange={onContactFiltersChange}
                        showSourceFilter={showSourceFilter}
                        sections={{ engagement: true, outreach: true }}
                    />
                </div>
            ) : null}
        </div>
    );
}
