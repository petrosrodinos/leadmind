import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { UserPlus, Users } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { AudienceFilterForm } from "@/pages/dashboard/pages/campaigns/components/audience-filter-form";
import { ContactSelectionTable } from "@/pages/dashboard/components/contact-selection-table";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import {
    useAddListContacts,
    useBulkAddListContacts,
} from "@/features/contact-lists/hooks/use-contact-lists";
import type { ContactFilters } from "@/interfaces/contact-filters.interface";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PICKER_PAGE_SIZE = 20;

interface AddContactsPanelProps {
    listUuid: string;
}

export function AddContactsPanel({ listUuid }: AddContactsPanelProps) {
    const [filters, setFilters] = useState<ContactFilters>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [pickerPage, setPickerPage] = useState(1);

    const debouncedFilters = useDebouncedValue(filters, 400);

    const contactsQuery = useMemo(
        () => ({
            page: pickerPage,
            limit: PICKER_PAGE_SIZE,
            exclude_list_uuid: listUuid,
            search: debouncedFilters.search,
            status: debouncedFilters.status,
            tags: debouncedFilters.tags,
            score_rules: debouncedFilters.score_rules,
            filter_uuid: debouncedFilters.filter_uuid,
            profile_field: debouncedFilters.profile_field,
            has_profile_field: debouncedFilters.has_profile_field,
            last_interaction_after: debouncedFilters.last_interaction_after,
            last_interaction_before: debouncedFilters.last_interaction_before,
            never_contacted: debouncedFilters.never_contacted,
            include_unsubscribed: debouncedFilters.include_unsubscribed,
        }),
        [listUuid, pickerPage, debouncedFilters],
    );

    const { data: contactsPage, isLoading, isFetching } = useContacts(contactsQuery);
    const addContacts = useAddListContacts();
    const bulkAdd = useBulkAddListContacts();

    const rows = contactsPage?.data ?? [];
    const total = contactsPage?.total ?? 0;
    const totalPages = contactsPage?.totalPages ?? 1;

    const handleFilterChange = (patch: Partial<ContactFilters>) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setPickerPage(1);
        setSelected(new Set());
    };

    const onToggleSelect = (uuid: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(uuid)) next.delete(uuid);
            else next.add(uuid);
            return next;
        });
    };

    const onToggleAll = (uuids: string[], select: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            for (const id of uuids) {
                if (select) next.add(id);
                else next.delete(id);
            }
            return next;
        });
    };

    const handleAddSelected = () => {
        if (selected.size === 0) return;
        addContacts.mutate(
            {
                listUuid,
                payload: { contact_uuids: Array.from(selected) },
            },
            {
                onSuccess: () => setSelected(new Set()),
            },
        );
    };

    const handleBulkAdd = () => {
        bulkAdd.mutate({
            listUuid,
            payload: { filters: debouncedFilters },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-base font-semibold text-foreground">Add contacts</h2>
                <p className="text-sm text-muted mt-1">
                    Filter your contacts, then add selected rows or all matching results.
                </p>
            </div>

            <AudienceFilterForm value={filters} onChange={handleFilterChange} />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                    <Users className="size-5 text-accent" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">
                            {isLoading && !contactsPage ? "…" : total} matching contacts
                        </div>
                        {selected.size > 0 ? (
                            <div className="text-xs text-muted">{selected.size} selected</div>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ActionButtonWithPending
                        size="sm"
                        variant="secondary"
                        isPending={addContacts.isPending}
                        isDisabled={selected.size === 0 || addContacts.isPending}
                        onPress={handleAddSelected}
                    >
                        <UserPlus className="size-4" />
                        Add selected
                    </ActionButtonWithPending>
                    <ActionButtonWithPending
                        size="sm"
                        isPending={bulkAdd.isPending}
                        isDisabled={total === 0 || bulkAdd.isPending}
                        onPress={handleBulkAdd}
                    >
                        Add all matching ({total})
                    </ActionButtonWithPending>
                </div>
            </div>

            <ContactSelectionTable
                rows={rows}
                selected={selected}
                onToggleSelect={onToggleSelect}
                onToggleAll={onToggleAll}
            />

            {totalPages > 1 ? (
                <div className="flex items-center justify-between text-sm text-muted">
                    <span>
                        Page {pickerPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="tertiary"
                            isDisabled={pickerPage <= 1 || isFetching}
                            onPress={() => setPickerPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            variant="tertiary"
                            isDisabled={pickerPage >= totalPages || isFetching}
                            onPress={() => setPickerPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
