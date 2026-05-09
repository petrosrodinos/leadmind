import { useState } from "react";
import { Button, Input, Label } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { FilterFormValues } from "../../validation-schemas/filter";

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

export function ManualKeyValueEditor({ value, onChange }: ManualKeyValueEditorProps) {
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

interface ManualQuerySectionProps {
    control: Control<FilterFormValues>;
}

export function ManualQuerySection({ control }: ManualQuerySectionProps) {
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
