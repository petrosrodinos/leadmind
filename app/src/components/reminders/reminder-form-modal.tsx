import { useEffect, useState } from "react";
import { Button, Input, Label, ListBox, Modal, Select, TextArea } from "@heroui/react";
import { ChevronDown, Filter, Search, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCreateReminder, useUpdateReminder } from "@/features/reminders/hooks/use-reminders";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { listContacts } from "@/features/contacts/services/contacts.service";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Reminder, ReminderContact } from "@/features/reminders/interfaces/reminder.interface";

interface ReminderFormModalProps {
    contactUuid?: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editing?: Reminder | null;
}

function toLocalDatetimeValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultRemindAt(): string {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return toLocalDatetimeValue(d);
}

export function ReminderFormModal({
    contactUuid,
    isOpen,
    onOpenChange,
    editing,
}: ReminderFormModalProps) {
    const createReminder = useCreateReminder();
    const updateReminder = useUpdateReminder();
    const isPending = createReminder.isPending || updateReminder.isPending;

    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [remindAt, setRemindAt] = useState(defaultRemindAt);

    const [selectedContact, setSelectedContact] = useState<ReminderContact | null>(null);
    const [selectedFilterUuid, setSelectedFilterUuid] = useState<string>("");
    const [contactSearch, setContactSearch] = useState("");
    const debouncedContactSearch = useDebouncedValue(contactSearch, 300);

    const showContactSelector = !contactUuid && !editing;

    const { data: filters = [] } = useFilters();

    const contactQuery = {
        filter_uuid: selectedFilterUuid || undefined,
        search: debouncedContactSearch || undefined,
        limit: 50,
        page: 1,
    };
    const { data: contactsPage, isLoading: contactsLoading } = useQuery({
        queryKey: contactsQueryKeys.list(contactQuery),
        queryFn: () => listContacts(contactQuery),
        enabled: showContactSelector && !!selectedFilterUuid,
        staleTime: 30_000,
    });
    const contactResults = contactsPage?.data ?? [];

    useEffect(() => {
        if (!isOpen) return;
        if (editing) {
            setTitle(editing.title ?? "");
            setNotes(editing.notes ?? "");
            setRemindAt(toLocalDatetimeValue(new Date(editing.remind_at)));
        } else {
            setTitle("");
            setNotes("");
            setRemindAt(defaultRemindAt());
            setSelectedContact(null);
            setSelectedFilterUuid("");
            setContactSearch("");
        }
    }, [isOpen, editing]);

    const resolvedContactUuid = contactUuid ?? selectedContact?.uuid;
    const canSubmit = !!remindAt && !!resolvedContactUuid && !isPending;

    const handleConfirm = () => {
        const dt = new Date(remindAt);
        if (isNaN(dt.getTime()) || !resolvedContactUuid) return;

        if (editing) {
            updateReminder.mutate(
                {
                    uuid: editing.uuid,
                    payload: {
                        title: title.trim() || undefined,
                        notes: notes.trim() || undefined,
                        remind_at: dt.toISOString(),
                    },
                },
                { onSuccess: () => onOpenChange(false) },
            );
        } else {
            createReminder.mutate(
                {
                    contact_uuid: resolvedContactUuid,
                    title: title.trim() || undefined,
                    notes: notes.trim() || undefined,
                    remind_at: dt.toISOString(),
                },
                { onSuccess: () => onOpenChange(false) },
            );
        }
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-md">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{editing ? "Edit reminder" : "New reminder"}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        {showContactSelector && (
                            <div className="flex flex-col gap-2">
                                <Label>
                                    Contact <span className="text-red-500">*</span>
                                </Label>

                                {selectedContact ? (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <User className="size-3.5 text-muted shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {selectedContact.name ?? selectedContact.email ?? "Contact"}
                                                </p>
                                                {selectedContact.company && (
                                                    <p className="text-xs text-muted truncate">{selectedContact.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="tertiary"
                                            className="text-xs shrink-0"
                                            onPress={() => {
                                                setSelectedContact(null);
                                                setContactSearch("");
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {/* Filter selector */}
                                        <Select
                                            aria-label="Select a filter"
                                            placeholder="Select a filter list…"
                                            value={selectedFilterUuid}
                                            onChange={(v) => {
                                                setSelectedFilterUuid((v as string) ?? "");
                                                setContactSearch("");
                                            }}
                                        >
                                            <Select.Trigger className="w-full">
                                                <span className="flex items-center gap-2 text-sm">
                                                    <Filter className="size-3.5 text-muted shrink-0" />
                                                    <Select.Value />
                                                </span>
                                                <Select.Indicator>
                                                    <ChevronDown className="size-3.5" />
                                                </Select.Indicator>
                                            </Select.Trigger>
                                            <Select.Popover>
                                                <ListBox>
                                                    {filters.map((f) => (
                                                        <ListBox.Item key={f.uuid} id={f.uuid} textValue={f.name}>
                                                            {f.name}
                                                            <ListBox.ItemIndicator />
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>

                                        {/* Contacts from selected filter */}
                                        {selectedFilterUuid && (
                                            <div className="flex flex-col gap-1.5">
                                                <div className="relative">
                                                    <Search className="size-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                    <Input
                                                        className="pl-9"
                                                        placeholder="Search contacts in this list…"
                                                        value={contactSearch}
                                                        onChange={(e) => setContactSearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-surface divide-y divide-border/60">
                                                    {contactsLoading ? (
                                                        Array.from({ length: 3 }).map((_, i) => (
                                                            <div key={i} className="px-3 py-2.5">
                                                                <div className="h-3.5 w-2/3 rounded bg-surface-secondary animate-pulse" />
                                                                <div className="h-3 w-1/2 rounded bg-surface-secondary animate-pulse mt-1.5" />
                                                            </div>
                                                        ))
                                                    ) : contactResults.length === 0 ? (
                                                        <div className="px-3 py-4 text-center">
                                                            <p className="text-xs text-muted">No contacts found.</p>
                                                        </div>
                                                    ) : (
                                                        contactResults.map((c) => (
                                                            <button
                                                                key={c.uuid}
                                                                type="button"
                                                                className="w-full flex flex-col items-start px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors"
                                                                onClick={() =>
                                                                    setSelectedContact({
                                                                        uuid: c.uuid,
                                                                        name: c.name ?? null,
                                                                        company: c.company ?? null,
                                                                        email: c.email ?? null,
                                                                    })
                                                                }
                                                            >
                                                                <span className="text-sm font-medium text-foreground">
                                                                    {c.name ?? c.email ?? "Contact"}
                                                                </span>
                                                                {(c.company || c.email) && (
                                                                    <span className="text-xs text-muted">
                                                                        {[c.company, c.email].filter(Boolean).join(" · ")}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reminder-title">Title</Label>
                            <Input
                                id="reminder-title"
                                placeholder="e.g. Follow-up Call, Contract Renewal…"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reminder-date">
                                Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="reminder-date"
                                type="datetime-local"
                                value={remindAt}
                                onChange={(e) => setRemindAt(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reminder-notes">Notes</Label>
                            <TextArea
                                id="reminder-notes"
                                rows={4}
                                placeholder="Additional context or action items…"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                maxLength={5000}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => onOpenChange(false)}
                            isDisabled={isPending}
                        >
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            size="sm"
                            variant="secondary"
                            isDisabled={!canSubmit}
                            isPending={isPending}
                            onPress={handleConfirm}
                        >
                            {editing ? "Save changes" : "Create reminder"}
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
