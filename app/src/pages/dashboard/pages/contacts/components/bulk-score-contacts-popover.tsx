import { useEffect, useMemo, useState } from "react";
import { Checkbox, Label, Modal } from "@heroui/react";
import { Gauge } from "lucide-react";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useBulkTriggerContactScore } from "@/features/contacts/hooks/use-contacts";
import { useFilters } from "@/features/filters/hooks/use-filters";
import type { Filter } from "@/features/filters/interfaces/filter.interface";

interface BulkScoreContactsPopoverProps {
    selectedContactUuids: string[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onScoringComplete?: () => void;
}

export function BulkScoreContactsPopover({
    selectedContactUuids,
    isOpen,
    onOpenChange,
    onScoringComplete,
}: BulkScoreContactsPopoverProps) {
    const { data: filters = [] } = useFilters();
    const bulkScore = useBulkTriggerContactScore();
    const [filterUuids, setFilterUuids] = useState<string[]>([]);
    const [ruleUuids, setRuleUuids] = useState<string[]>([]);
    const [useBatch, setUseBatch] = useState(false);

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

    useEffect(() => {
        if (!isOpen) {
            setFilterUuids([]);
            setRuleUuids([]);
            setUseBatch(false);
        }
    }, [isOpen]);

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
                use_batch: useBatch,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    onScoringComplete?.();
                },
            },
        );
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-md">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Bulk scoring</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-3">
                        <p className="text-[11px] text-muted leading-snug">
                            {selectedContactUuids.length} contact
                            {selectedContactUuids.length === 1 ? "" : "s"} selected. Choose filters, then scoring
                            rules attached to those filters. Each contact is only scored for rules that exist on its
                            own filter.
                        </p>
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
                        <div>
                            <Checkbox
                                isSelected={useBatch}
                                onChange={(checked: boolean) => setUseBatch(checked)}
                                isDisabled={bulkScore.isPending}
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <span className="text-xs text-muted">
                                    Use OpenAI Batch API (50% cheaper, results within 24h)
                                </span>
                            </Checkbox>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <ActionButtonWithPending
                            size="sm"
                            variant="tertiary"
                            onPress={() => onOpenChange(false)}
                            isDisabled={bulkScore.isPending}
                        >
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
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
