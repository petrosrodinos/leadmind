import { useEffect, useMemo, useState } from "react";
import { Label, Popover } from "@heroui/react";
import { Gauge } from "lucide-react";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useBulkTriggerContactScore } from "@/features/contacts/hooks/use-contacts";
import { useFilters } from "@/features/filters/hooks/use-filters";
import type { Filter } from "@/features/filters/interfaces/filter.interface";

interface BulkScoreContactsPopoverProps {
    selectedContactUuids: string[];
    onScoringComplete?: () => void;
}

export function BulkScoreContactsPopover({ selectedContactUuids, onScoringComplete }: BulkScoreContactsPopoverProps) {
    const { data: filters = [] } = useFilters();
    const bulkScore = useBulkTriggerContactScore();
    const [open, setOpen] = useState(false);
    const [filterUuids, setFilterUuids] = useState<string[]>([]);
    const [ruleUuids, setRuleUuids] = useState<string[]>([]);

    const selectedFilters = useMemo(
        () => filters.filter((f: Filter) => filterUuids.includes(f.uuid)),
        [filters, filterUuids],
    );

    const ruleOptions: MultiSelectOption[] = useMemo(() => {
        const map = new Map<string, string>();
        for (const f of selectedFilters) {
            for (const si of f.scoring_instructions) {
                const prev = map.get(si.uuid);
                const piece = `${f.name} — ${si.name}`;
                map.set(si.uuid, prev ? `${prev} · ${piece}` : piece);
            }
        }
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [selectedFilters]);

    useEffect(() => {
        const allowed = new Set(ruleOptions.map((o) => o.value));
        setRuleUuids((prev) => prev.filter((id) => allowed.has(id)));
    }, [ruleOptions]);

    const canSubmit =
        selectedContactUuids.length > 0 &&
        filterUuids.length > 0 &&
        ruleUuids.length > 0 &&
        !bulkScore.isPending;

    const run = () => {
        if (!canSubmit) return;
        bulkScore.mutate(
            {
                contact_uuids: selectedContactUuids,
                filter_uuids: filterUuids,
                scoring_instruction_uuids: ruleUuids,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setFilterUuids([]);
                    setRuleUuids([]);
                    onScoringComplete?.();
                },
            },
        );
    };

    return (
        <Popover isOpen={open} onOpenChange={setOpen}>
            <Popover.Trigger>
                <ActionButtonWithPending
                    variant="secondary"
                    size="md"
                    isDisabled={selectedContactUuids.length === 0}
                    isPending={bulkScore.isPending}
                    idleLeading={<Gauge className="size-4" />}
                >
                    Score selected
                </ActionButtonWithPending>
            </Popover.Trigger>
            <Popover.Content
                placement="bottom end"
                className="w-[min(100vw-1.25rem,22rem)] rounded-xl border border-border bg-overlay/95 p-3 shadow-xl backdrop-blur-md outline-none"
            >
                <Popover.Dialog className="outline-none space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Bulk scoring</p>
                        <p className="text-[11px] text-muted mt-0.5 leading-snug">
                            {selectedContactUuids.length} contact{selectedContactUuids.length === 1 ? "" : "s"} selected. Choose filters, then scoring rules attached to those filters. Each contact is only scored for rules that exist on its own filter.
                        </p>
                    </div>
                    <div>
                        <Label className="mb-1 block text-xs text-muted">Filters</Label>
                        <MultiSelect
                            aria-label="Filters for scoring rules"
                            options={filters.map((f) => ({ value: f.uuid, label: f.name }))}
                            value={filterUuids}
                            onChange={setFilterUuids}
                            placeholder="Select filters…"
                        />
                    </div>
                    <div>
                        <Label className="mb-1 block text-xs text-muted">Scoring rules</Label>
                        <MultiSelect
                            aria-label="Scoring rules"
                            options={ruleOptions}
                            value={ruleUuids}
                            onChange={setRuleUuids}
                            placeholder={
                                filterUuids.length === 0
                                    ? "Select filters first…"
                                    : ruleOptions.length === 0
                                      ? "No rules on selected filters"
                                      : "Select scoring rules…"
                            }
                            disabled={filterUuids.length === 0 || ruleOptions.length === 0}
                        />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1 border-t border-border/60">
                        <ActionButtonWithPending size="sm" variant="tertiary" onPress={() => setOpen(false)} isDisabled={bulkScore.isPending}>
                            Cancel
                        </ActionButtonWithPending>
                        <ActionButtonWithPending
                            size="sm"
                            variant="secondary"
                            isDisabled={!canSubmit}
                            isPending={bulkScore.isPending}
                            onPress={run}
                            idleLeading={<Gauge className="size-3.5" />}
                        >
                            Run scoring
                        </ActionButtonWithPending>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
