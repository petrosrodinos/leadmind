import { Controller } from "react-hook-form";
import { Input, Label, ListBox, Select } from "@heroui/react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useGemiPrefectures, useGemiLegalTypes, useGemiStatuses } from "@/features/gemi/hooks/use-gemi-metadata";
import type { FilterQueryFieldsProps } from "./types";
import type { MultiSelectOption } from "@/components/ui/multi-select";

function toOptions(items: { id: number | string; descr: string }[]): MultiSelectOption[] {
    return items.map((item) => ({ value: String(item.id), label: item.descr }));
}

export function GemiQueryFields({ register, control }: FilterQueryFieldsProps) {
    const { data: prefectures = [], isLoading: loadingPrefectures } = useGemiPrefectures();
    const { data: legalTypes = [], isLoading: loadingLegalTypes } = useGemiLegalTypes();
    const { data: statuses = [], isLoading: loadingStatuses } = useGemiStatuses();

    return (
        <div className="flex flex-col gap-5">
            {/* Company search */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="cfg-gemi-name">Company name</Label>
                    <Input
                        id="cfg-gemi-name"
                        placeholder="e.g. Alpha"
                        {...register("query_config.name" as const)}
                    />
                    <p className="text-xs text-muted">
                        Optional free-text search on the company name. Leave blank to match all.
                    </p>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="cfg-gemi-activities">Activities (ΚΑΔ codes)</Label>
                    <Input
                        id="cfg-gemi-activities"
                        placeholder="47.11, 56.10, 62.01"
                        {...register("query_config.activities" as const)}
                    />
                    <p className="text-xs text-muted">
                        Comma-separated ΚΑΔ activity codes. Leave blank to skip activity filtering.
                    </p>
                </div>
            </div>

            {/* Geography */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Prefectures</Label>
                    <Controller
                        control={control}
                        name="query_config.prefectures"
                        render={({ field }) => (
                            <MultiSelect
                                options={toOptions(prefectures)}
                                value={(field.value as string[]) ?? []}
                                onChange={field.onChange}
                                placeholder={loadingPrefectures ? "Loading…" : "Any prefecture"}
                                disabled={loadingPrefectures}
                                aria-label="Prefectures"
                            />
                        )}
                    />
                </div>
            </div>

            {/* Company details */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label>Legal type</Label>
                    <Controller
                        control={control}
                        name="query_config.legalTypes"
                        render={({ field }) => (
                            <MultiSelect
                                options={toOptions(legalTypes)}
                                value={(field.value as string[]) ?? []}
                                onChange={field.onChange}
                                placeholder={loadingLegalTypes ? "Loading…" : "Any legal type"}
                                disabled={loadingLegalTypes}
                                aria-label="Legal types"
                            />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Status</Label>
                    <Controller
                        control={control}
                        name="query_config.statuses"
                        render={({ field }) => (
                            <MultiSelect
                                options={toOptions(statuses)}
                                value={(field.value as string[]) ?? []}
                                onChange={field.onChange}
                                placeholder={loadingStatuses ? "Loading…" : "Any status"}
                                disabled={loadingStatuses}
                                aria-label="Company statuses"
                            />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Active status</Label>
                    <Controller
                        control={control}
                        name="query_config.isActive"
                        render={({ field }) => (
                            <Select
                                className="w-full"
                                value={(field.value as string) ?? ""}
                                onChange={(v) => field.onChange(v as string)}
                            >
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id="" textValue="Any">
                                            Any
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id="true" textValue="Active only">
                                            Active only
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        <ListBox.Item id="false" textValue="Inactive only">
                                            Inactive only
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-gemi-maxleads">Max leads per run</Label>
                    <Input
                        id="cfg-gemi-maxleads"
                        type="number"
                        placeholder="100"
                        {...register("query_config.maxLeads" as const)}
                    />
                    <p className="text-xs text-muted">Maximum companies to fetch per run.</p>
                </div>
            </div>
        </div>
    );
}
