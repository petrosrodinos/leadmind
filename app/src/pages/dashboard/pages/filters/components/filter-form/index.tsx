import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    FieldError,
    Form,
    Input,
    Label,
    ListBox,
    Select,
    Switch,
    TextArea,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import type {
    CreateFilterPayload,
    Filter,
} from "@/features/filters/interfaces/filter.interface";
import {
    ENRICHMENT_SOURCE_OPTIONS,
    type EnrichmentSource,
} from "@/features/lead-enrichment/constants/enrichment-sources";
import {
    FilterFormSchema,
    type FilterFormValues,
} from "../../validation-schemas/filter";
import {
    CHANNEL_OPTIONS,
    CRON_NONE,
    CRON_PRESETS,
    SOURCE_OPTIONS,
    cronPreview,
    cronToSelectId,
    selectIdToCron,
} from "./constants";
import { buildDefaults } from "./defaults";
import { resetQueryConfigForSource } from "./empty-query-config";
import { QueryConfigFields } from "./query-config-fields";
import { serializeQueryConfig } from "./serialize-query-config";

interface FilterFormProps {
    initial?: Filter;
    onSubmit: (payload: CreateFilterPayload) => void | Promise<void>;
    onCancel: () => void;
    isPending: boolean;
    submitLabel: string;
}

export function FilterForm({
    initial,
    onSubmit,
    onCancel,
    isPending,
    submitLabel,
}: FilterFormProps) {
    const defaults = useMemo(() => buildDefaults(initial), [initial?.uuid]);

    const form = useForm<FilterFormValues>({
        resolver: zodResolver(FilterFormSchema) as unknown as Resolver<FilterFormValues>,
        defaultValues: defaults,
        mode: "onSubmit",
    });

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = form;

    useEffect(() => {
        reset(defaults);
    }, [defaults, reset]);

    const sourceType = useWatch({ control, name: "source_type" });
    const cronValue = useWatch({ control, name: "cron_schedule" });

    const handleSourceChange = (next: FilterFormValues["source_type"]) => {
        setValue("source_type", next, { shouldValidate: false });
        setValue(
            "query_config",
            resetQueryConfigForSource(next) as never,
            { shouldValidate: false },
        );
    };

    const submit: SubmitHandler<FilterFormValues> = async (values) => {
        const cfg = serializeQueryConfig(values);
        const payload: CreateFilterPayload = {
            name: values.name.trim(),
            source_type: values.source_type,
            query_config: cfg,
            enrichment_sources: values.enrichment_sources,
            channels: values.channels,
            enabled: values.enabled,
            cron_schedule:
                values.source_type === SourceType.MANUAL
                    ? undefined
                    : values.cron_schedule?.trim() || undefined,
            ai_instructions: values.ai_instructions?.trim() || undefined,
        };
        await onSubmit(payload);
    };

    const cronHint = cronPreview(cronValue);
    const cronInvalid = !!cronValue && cronHint === "Invalid cron expression";

    return (
        <Form
            onSubmit={handleSubmit(submit)}
            className="grid gap-5 bg-surface rounded-xl border border-border p-6"
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-name">Name</Label>
                <Input
                    id="filter-name"
                    placeholder="e.g. Boston SaaS founders"
                    {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </div>

            <div className="grid gap-1.5">
                <Label>Source type</Label>
                <Controller
                    control={control}
                    name="source_type"
                    render={({ field }) => (
                        <Select
                            className="w-full"
                            value={field.value}
                            onChange={(v) =>
                                handleSourceChange(v as FilterFormValues["source_type"])
                            }
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox>
                                    {SOURCE_OPTIONS.map((opt) => (
                                        <ListBox.Item
                                            key={opt.id}
                                            id={opt.id}
                                            textValue={opt.label}
                                        >
                                            {opt.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    )}
                />
            </div>

            <QueryConfigFields
                sourceType={sourceType}
                register={register}
                errors={errors}
                control={control}
            />

            <div className="grid gap-1.5">
                <Label>Enrichment sources</Label>
                <Controller
                    control={control}
                    name="enrichment_sources"
                    render={({ field }) => (
                        <Select
                            className="w-full"
                            placeholder="Select enrichment sources"
                            selectionMode="multiple"
                            value={field.value as Key[]}
                            onChange={(keys) =>
                                field.onChange((keys as Key[]).map(String) as EnrichmentSource[])
                            }
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox selectionMode="multiple">
                                    {ENRICHMENT_SOURCE_OPTIONS.map((opt) => (
                                        <ListBox.Item
                                            key={opt.id}
                                            id={opt.id}
                                            textValue={opt.label}
                                        >
                                            {opt.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    )}
                />
                {errors.enrichment_sources && (
                    <FieldError>
                        {errors.enrichment_sources.message as string}
                    </FieldError>
                )}
            </div>

            <div className="grid gap-1.5">
                <Label>Channels</Label>
                <Controller
                    control={control}
                    name="channels"
                    render={({ field }) => (
                        <Select
                            className="w-full"
                            placeholder="Select channels"
                            selectionMode="multiple"
                            value={field.value as Key[]}
                            onChange={(keys) =>
                                field.onChange((keys as Key[]).map(String) as Channel[])
                            }
                        >
                            <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                                <ListBox selectionMode="multiple">
                                    {CHANNEL_OPTIONS.map((opt) => (
                                        <ListBox.Item
                                            key={opt.id}
                                            id={opt.id}
                                            textValue={opt.label}
                                        >
                                            {opt.label}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    )}
                />
                {errors.channels && (
                    <FieldError>{errors.channels.message as string}</FieldError>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-ai">AI Instructions (optional)</Label>
                <TextArea
                    id="filter-ai"
                    rows={4}
                    placeholder="Tell the AI how to score & draft outreach for these leads…"
                    {...register("ai_instructions")}
                />
                {errors.ai_instructions && (
                    <FieldError>{errors.ai_instructions.message as string}</FieldError>
                )}
            </div>

            {sourceType !== SourceType.MANUAL && (
                <div className="grid gap-1.5">
                    <Label>Cron schedule</Label>
                    <Controller
                        control={control}
                        name="cron_schedule"
                        render={({ field }) => (
                            <Select
                                className="w-full"
                                value={cronToSelectId(field.value)}
                                onChange={(v) => field.onChange(selectIdToCron(String(v)))}
                            >
                                <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        <ListBox.Item id={CRON_NONE} textValue="No schedule">
                                            No schedule (manual runs only)
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                        {CRON_PRESETS.map((opt) => (
                                            <ListBox.Item
                                                key={opt.id}
                                                id={opt.id}
                                                textValue={opt.label}
                                            >
                                                {opt.label}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        )}
                    />
                    {cronHint && (
                        <p
                            className={
                                cronInvalid
                                    ? "text-xs text-danger"
                                    : "text-xs text-muted"
                            }
                        >
                            {cronHint}
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Enabled</span>
                    <span className="text-xs text-muted">
                        Disabled filters won't run on schedule.
                    </span>
                </div>
                <Controller
                    control={control}
                    name="enabled"
                    render={({ field }) => (
                        <Switch
                            isSelected={field.value}
                            onChange={field.onChange}
                            aria-label="Enabled"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                    )}
                />
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onPress={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isDisabled={isPending || cronInvalid}
                    isPending={isPending}
                >
                    {submitLabel}
                </Button>
            </div>
        </Form>
    );
}
