import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import { Plus, Trash } from "lucide-react";
import cronstrue from "cronstrue";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import type {
    CreateFilterPayload,
    Filter,
} from "@/features/filters/interfaces/filter.interface";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import {
    FilterFormSchema,
    type FilterFormValues,
} from "../validation-schemas/filter";

const SOURCE_OPTIONS: Array<{ id: SourceType; label: string }> = [
    { id: SourceType.LINKEDIN, label: "LinkedIn" },
    { id: SourceType.GOOGLE_MAPS, label: "Google Maps" },
    { id: SourceType.MANUAL, label: "Manual" },
];

const CHANNEL_OPTIONS: Array<{ id: Channel; label: string }> = [
    { id: Channel.EMAIL, label: "Email" },
    { id: Channel.SMS, label: "SMS" },
    { id: Channel.LINKEDIN, label: "LinkedIn" },
];

const CRON_NONE = "__none__";

const CRON_PRESETS: Array<{ id: string; label: string; expr: string }> = [
    { id: "hourly", label: "Every hour", expr: "0 * * * *" },
    { id: "every-6h", label: "Every 6 hours", expr: "0 */6 * * *" },
    { id: "daily-9am", label: "Every day at 9:00 AM", expr: "0 9 * * *" },
    { id: "daily-midnight", label: "Every day at midnight", expr: "0 0 * * *" },
    { id: "weekdays-9am", label: "Weekdays at 9:00 AM", expr: "0 9 * * 1-5" },
    { id: "monday-9am", label: "Every Monday at 9:00 AM", expr: "0 9 * * 1" },
    { id: "sunday-midnight", label: "Every Sunday at midnight", expr: "0 0 * * 0" },
];

const CRON_VALUE_TO_ID = new Map<string, string>(
    CRON_PRESETS.map((p) => [p.expr, p.id]),
);

const cronToSelectId = (expr: string | null | undefined): string => {
    if (!expr) return CRON_NONE;
    return CRON_VALUE_TO_ID.get(expr) ?? CRON_NONE;
};

const selectIdToCron = (id: string): string => {
    if (id === CRON_NONE) return "";
    return CRON_PRESETS.find((p) => p.id === id)?.expr ?? "";
};

const cronPreview = (expr: string | undefined): string | null => {
    if (!expr) return null;
    try {
        return cronstrue.toString(expr);
    } catch {
        return "Invalid cron expression";
    }
};

interface FilterFormProps {
    initial?: Filter;
    onSubmit: (payload: CreateFilterPayload) => void | Promise<void>;
    onCancel: () => void;
    isPending: boolean;
    submitLabel: string;
}

const buildDefaults = (initial?: Filter): FilterFormValues => {
    const source_type = (initial?.source_type as
        | typeof SourceType.LINKEDIN
        | typeof SourceType.GOOGLE_MAPS
        | typeof SourceType.MANUAL) ?? SourceType.LINKEDIN;
    const channels = (initial?.channels?.length
        ? initial.channels
        : [Channel.EMAIL]) as Channel[];
    const cron_schedule = initial?.cron_schedule ?? "";
    const ai_instructions = initial?.ai_instructions ?? "";
    const enabled = initial?.enabled ?? true;
    const name = initial?.name ?? "";
    const cfg = (initial?.query_config ?? {}) as Record<string, any>;

    if (source_type === SourceType.LINKEDIN) {
        return {
            name,
            source_type: SourceType.LINKEDIN,
            query_config: {
                keywords: typeof cfg.keywords === "string" ? cfg.keywords : "",
                location: typeof cfg.location === "string" ? cfg.location : "",
                industry: typeof cfg.industry === "string" ? cfg.industry : "",
                limit: typeof cfg.limit === "number" ? cfg.limit : undefined,
            },
            enabled,
            cron_schedule,
            channels,
            ai_instructions,
        };
    }
    if (source_type === SourceType.GOOGLE_MAPS) {
        return {
            name,
            source_type: SourceType.GOOGLE_MAPS,
            query_config: {
                query: typeof cfg.query === "string" ? cfg.query : "",
                location: typeof cfg.location === "string" ? cfg.location : "",
                limit: typeof cfg.limit === "number" ? cfg.limit : undefined,
            },
            enabled,
            cron_schedule,
            channels,
            ai_instructions,
        };
    }
    const manualConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(cfg)) {
        if (typeof v === "string") manualConfig[k] = v;
        else if (v != null) manualConfig[k] = String(v);
    }
    return {
        name,
        source_type: SourceType.MANUAL,
        query_config: manualConfig,
        enabled,
        cron_schedule,
        channels,
        ai_instructions,
    };
};

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

    const handleSourceChange = (next: SourceType) => {
        if (next === SourceType.LINKEDIN) {
            setValue("source_type", SourceType.LINKEDIN, { shouldValidate: false });
            setValue("query_config", { keywords: "", location: "", industry: "" } as never, {
                shouldValidate: false,
            });
        } else if (next === SourceType.GOOGLE_MAPS) {
            setValue("source_type", SourceType.GOOGLE_MAPS, { shouldValidate: false });
            setValue("query_config", { query: "", location: "" } as never, {
                shouldValidate: false,
            });
        } else {
            setValue("source_type", SourceType.MANUAL, { shouldValidate: false });
            setValue("query_config", {} as never, { shouldValidate: false });
        }
    };

    const submit: SubmitHandler<FilterFormValues> = async (values) => {
        const cfg: Record<string, unknown> = { ...(values.query_config as object) };
        // Strip empty strings so the backend doesn't store them.
        for (const k of Object.keys(cfg)) {
            if (cfg[k] === "" || cfg[k] == null) delete cfg[k];
        }

        const payload: CreateFilterPayload = {
            name: values.name.trim(),
            source_type: values.source_type,
            query_config: cfg,
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
                            onChange={(v) => handleSourceChange(v as SourceType)}
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

interface QueryConfigFieldsProps {
    sourceType: SourceType;
    register: ReturnType<typeof useForm<FilterFormValues>>["register"];
    errors: Record<string, any>;
    control: ReturnType<typeof useForm<FilterFormValues>>["control"];
}

function QueryConfigFields({
    sourceType,
    register,
    errors,
    control,
}: QueryConfigFieldsProps) {
    if (sourceType === SourceType.LINKEDIN) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="cfg-keywords">Keywords</Label>
                    <Input
                        id="cfg-keywords"
                        placeholder="Founder, head of growth"
                        {...register("query_config.keywords" as const)}
                    />
                    <p className="text-xs text-muted">
                        Comma-separated job titles or skills the scraper searches for in
                        LinkedIn profiles.
                    </p>
                    {errors.query_config?.keywords && (
                        <FieldError>
                            {errors.query_config.keywords.message as string}
                        </FieldError>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-location">Location</Label>
                    <Controller
                        control={control}
                        name="query_config.location"
                        render={({ field }) => (
                            <LocationAutocomplete
                                id="cfg-location"
                                placeholder="San Francisco Bay Area"
                                value={(field.value as string) ?? ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <p className="text-xs text-muted">
                        Geographic area to restrict results to. Leave blank for worldwide.
                    </p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-industry">Industry</Label>
                    <Input
                        id="cfg-industry"
                        placeholder="Software"
                        {...register("query_config.industry" as const)}
                    />
                    <p className="text-xs text-muted">
                        Optional industry filter applied on top of the keywords.
                    </p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-limit">Limit</Label>
                    <Input
                        id="cfg-limit"
                        type="number"
                        placeholder="50"
                        {...register("query_config.limit" as const)}
                    />
                    <p className="text-xs text-muted">
                        Max profiles to fetch per run. Higher = slower & more expensive.
                    </p>
                </div>
            </div>
        );
    }

    if (sourceType === SourceType.GOOGLE_MAPS) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="cfg-query">Query</Label>
                    <Input
                        id="cfg-query"
                        placeholder="dentists in austin"
                        {...register("query_config.query" as const)}
                    />
                    <p className="text-xs text-muted">
                        The search string sent to Google Maps — what kind of business
                        you're looking for (e.g. "real estate agents").
                    </p>
                    {errors.query_config?.query && (
                        <FieldError>
                            {errors.query_config.query.message as string}
                        </FieldError>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-location-gm">Location</Label>
                    <Controller
                        control={control}
                        name="query_config.location"
                        render={({ field }) => (
                            <LocationAutocomplete
                                id="cfg-location-gm"
                                placeholder="Austin, TX"
                                value={(field.value as string) ?? ""}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <p className="text-xs text-muted">
                        Pick a location from the dropdown — we look it up against
                        OpenStreetMap, the same source the scraper uses.
                    </p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cfg-limit-gm">Limit</Label>
                    <Input
                        id="cfg-limit-gm"
                        type="number"
                        placeholder="50"
                        {...register("query_config.limit" as const)}
                    />
                    <p className="text-xs text-muted">
                        Max places to fetch per run.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Controller
            control={control}
            name="query_config"
            render={({ field }) => (
                <ManualKeyValueEditor
                    value={(field.value ?? {}) as Record<string, string>}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

interface KeyValuePair {
    id: string;
    key: string;
    value: string;
}

const pairId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const objectToPairs = (obj: Record<string, string>): KeyValuePair[] =>
    Object.entries(obj).map(([key, value]) => ({
        id: pairId(),
        key,
        value: value ?? "",
    }));

const pairsToObject = (pairs: KeyValuePair[]): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const p of pairs) {
        const k = p.key.trim();
        if (!k) continue;
        out[k] = p.value;
    }
    return out;
};

interface ManualKeyValueEditorProps {
    value: Record<string, string>;
    onChange: (next: Record<string, string>) => void;
}

function ManualKeyValueEditor({ value, onChange }: ManualKeyValueEditorProps) {
    const [pairs, setPairs] = useState<KeyValuePair[]>(() => objectToPairs(value));

    const sync = (next: KeyValuePair[]) => {
        setPairs(next);
        onChange(pairsToObject(next));
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
                <Label>Custom fields</Label>
                <span className="text-xs text-muted">
                    Optional metadata stored on the filter.
                </span>
            </div>
            <p className="text-xs text-muted">
                Manual filters group contacts you create by hand. Add any custom key-value
                pairs you'd like attached to this filter (e.g. campaign tag, owner,
                notes).
            </p>

            {pairs.length === 0 ? (
                <p className="text-sm text-muted italic py-2">
                    No fields yet. Click "Add field" to start.
                </p>
            ) : (
                <div className="grid gap-2">
                    {pairs.map((pair, idx) => (
                        <div key={pair.id} className="flex items-center gap-2">
                            <Input
                                aria-label={`Field ${idx + 1} key`}
                                placeholder="key"
                                value={pair.key}
                                onChange={(e) =>
                                    sync(
                                        pairs.map((p) =>
                                            p.id === pair.id
                                                ? { ...p, key: e.target.value }
                                                : p,
                                        ),
                                    )
                                }
                                className="flex-1 min-w-0"
                            />
                            <Input
                                aria-label={`Field ${idx + 1} value`}
                                placeholder="value"
                                value={pair.value}
                                onChange={(e) =>
                                    sync(
                                        pairs.map((p) =>
                                            p.id === pair.id
                                                ? { ...p, value: e.target.value }
                                                : p,
                                        ),
                                    )
                                }
                                className="flex-1 min-w-0"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="tertiary"
                                aria-label="Remove field"
                                onPress={() =>
                                    sync(pairs.filter((p) => p.id !== pair.id))
                                }
                            >
                                <Trash className="size-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() =>
                        sync([...pairs, { id: pairId(), key: "", value: "" }])
                    }
                >
                    <Plus className="size-3.5" />
                    Add field
                </Button>
            </div>
        </div>
    );
}
