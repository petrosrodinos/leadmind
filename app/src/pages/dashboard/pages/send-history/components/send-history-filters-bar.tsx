import { Button, Input, ListBox, Select, TextField } from "@heroui/react";
import { CalendarDays, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SendHistoryFilterOption {
    id: string;
    label: string;
}

interface SendHistoryFiltersBarProps {
    search: string;
    channel: string;
    source: string;
    status: string;
    emailProvider: string;
    campaignUuid: string;
    dateFrom: string;
    dateTo: string;
    channelOptions: SendHistoryFilterOption[];
    sourceOptions: SendHistoryFilterOption[];
    statusOptions: SendHistoryFilterOption[];
    providerOptions: SendHistoryFilterOption[];
    campaignOptions: SendHistoryFilterOption[];
    hasActiveFilters: boolean;
    onSearchChange: (value: string) => void;
    onChannelChange: (value: string) => void;
    onSourceChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onEmailProviderChange: (value: string) => void;
    onCampaignChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onClear: () => void;
}

export function SendHistoryFiltersBar({
    search,
    channel,
    source,
    status,
    emailProvider,
    campaignUuid,
    dateFrom,
    dateTo,
    channelOptions,
    sourceOptions,
    statusOptions,
    providerOptions,
    campaignOptions,
    hasActiveFilters,
    onSearchChange,
    onChannelChange,
    onSourceChange,
    onStatusChange,
    onEmailProviderChange,
    onCampaignChange,
    onDateFromChange,
    onDateToChange,
    onClear,
}: SendHistoryFiltersBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full min-w-[220px] max-w-sm grow sm:grow-0 sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
                <TextField name="search" className="w-full">
                    <Input
                        className="h-8 pl-8 text-[13px]"
                        placeholder="Search contacts…"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search contacts"
                    />
                </TextField>
            </div>

            <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />

            <FilterSelect
                label="Channel"
                value={channel}
                options={channelOptions}
                onChange={onChannelChange}
                className="w-[9.5rem]"
            />
            <FilterSelect
                label="Source"
                value={source}
                options={sourceOptions}
                onChange={onSourceChange}
                className="w-[9.5rem]"
            />
            <FilterSelect
                label="Status"
                value={status}
                options={statusOptions}
                onChange={onStatusChange}
                className="w-[9.5rem]"
            />
            <FilterSelect
                label="Integration"
                value={emailProvider}
                options={providerOptions}
                onChange={onEmailProviderChange}
                className="w-[9.5rem]"
            />
            <FilterSelect
                label="Campaign"
                value={campaignUuid}
                options={campaignOptions}
                onChange={onCampaignChange}
                className="w-[11rem]"
            />

            <div
                className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2",
                    "focus-within:border-accent/40",
                )}
            >
                <CalendarDays className="size-3.5 text-muted shrink-0" aria-hidden />
                <TextField name="date_from" className="w-[7.75rem]">
                    <Input
                        type="date"
                        className="h-7 border-0 bg-transparent px-1 text-[12px] shadow-none"
                        aria-label="Sent from"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => onDateFromChange(e.target.value)}
                    />
                </TextField>
                <span className="text-[11px] text-muted shrink-0">–</span>
                <TextField name="date_to" className="w-[7.75rem]">
                    <Input
                        type="date"
                        className="h-7 border-0 bg-transparent px-1 text-[12px] shadow-none"
                        aria-label="Sent to"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => onDateToChange(e.target.value)}
                    />
                </TextField>
            </div>

            {hasActiveFilters ? (
                <Button
                    size="sm"
                    variant="tertiary"
                    className="h-8 px-2.5 text-[12px]"
                    onPress={onClear}
                >
                    <X className="size-3.5" />
                    Reset
                </Button>
            ) : null}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
    className,
}: {
    label: string;
    value: string;
    options: SendHistoryFilterOption[];
    onChange: (value: string) => void;
    className?: string;
}) {
    const selected = options.find((option) => option.id === value) ?? options[0];

    return (
        <Select
            className={className}
            aria-label={label}
            selectedKey={selected.id}
            onSelectionChange={(key) => onChange(String(key ?? ""))}
        >
            <Select.Trigger className="h-8 w-full text-[13px]">
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    {options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                            {option.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
