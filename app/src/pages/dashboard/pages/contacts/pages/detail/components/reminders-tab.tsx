import { useState } from "react";
import { Button } from "@heroui/react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { NotificationPermissionBanner } from "@/components/ui/notification-permission-banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    useCompleteReminder,
    useDeleteReminder,
    useReminders,
} from "@/features/reminders/hooks/use-reminders";
import type { Reminder } from "@/features/reminders/interfaces/reminder.interface";
import { cn } from "@/lib/utils";
import { ReminderFormModal, ReminderStatusBadge } from "@/components/reminders";

interface RemindersTabProps {
    contactUuid: string;
}

function formatReminderDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function ReminderCountdown({ dateStr }: { dateStr: string }) {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) {
        const days = Math.floor(-diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(-diff / (1000 * 60 * 60));
        if (days >= 1) return <span className="text-red-500 text-xs">Overdue by {days}d</span>;
        return <span className="text-red-500 text-xs">Overdue by {hours}h</span>;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return <span className="text-orange-500 text-xs">Due in {hours}h</span>;
    if (days === 1) return <span className="text-yellow-600 text-xs">Due tomorrow</span>;
    return <span className="text-muted text-xs">Due in {days} days</span>;
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const complete = useCompleteReminder();
    const del = useDeleteReminder();

    const isOverdue =
        reminder.status === "PENDING" && new Date(reminder.remind_at) < new Date();
    const isDueToday =
        reminder.status === "PENDING" &&
        new Date(reminder.remind_at).toDateString() === new Date().toDateString();

    return (
        <>
            <div
                className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                    isOverdue && "border-red-200 bg-red-50/50",
                    isDueToday && !isOverdue && "border-orange-200 bg-orange-50/50",
                    !isOverdue && !isDueToday && "border-border bg-surface/80",
                    reminder.status === "COMPLETED" && "opacity-60",
                )}
            >
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                            {reminder.title ?? "Reminder"}
                        </span>
                        <ReminderStatusBadge status={reminder.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
                        <span>{formatReminderDate(reminder.remind_at)}</span>
                        {reminder.status === "PENDING" && (
                            <>
                                <span>·</span>
                                <ReminderCountdown dateStr={reminder.remind_at} />
                            </>
                        )}
                    </div>
                    {reminder.notes && (
                        <p className="text-xs text-muted mt-1 line-clamp-2">{reminder.notes}</p>
                    )}
                </div>

                {reminder.status === "PENDING" && (
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => setEditOpen(true)}
                            className="text-xs"
                        >
                            Edit
                        </Button>
                        <ActionButtonWithPending
                            size="sm"
                            variant="tertiary"
                            isDisabled={complete.isPending}
                            isPending={complete.isPending}
                            onPress={() => complete.mutate(reminder.uuid)}
                            className="text-xs text-green-600 hover:text-green-700"
                        >
                            Done
                        </ActionButtonWithPending>
                        <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => setDeleteOpen(true)}
                            className="text-xs text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            <ReminderFormModal
                contactUuid={reminder.contact_uuid}
                isOpen={editOpen}
                onOpenChange={setEditOpen}
                editing={reminder}
            />

            <ConfirmDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this reminder?"
                description="This action cannot be undone. The scheduled notification will also be cancelled."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={del.isPending}
                onConfirm={() =>
                    del.mutate(reminder.uuid, { onSuccess: () => setDeleteOpen(false) })
                }
            />
        </>
    );
}

export function RemindersTab({ contactUuid }: RemindersTabProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");

    const { data: remindersPage, isLoading } = useReminders({
        contact_uuid: contactUuid,
        status: filter === "all" ? undefined : filter === "pending" ? "PENDING" : "COMPLETED",
        limit: 100,
    });
    const reminders = remindersPage?.data ?? [];

    const filterOptions = [
        { id: "pending" as const, label: "Pending" },
        { id: "completed" as const, label: "Completed" },
        { id: "all" as const, label: "All" },
    ];

    return (
        <div className="flex flex-col gap-4 max-w-3xl">
            <NotificationPermissionBanner />
            <div className="rounded-2xl border border-border/80 bg-surface/80">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <Bell className="size-4 text-muted" />
                        <h3 className="text-sm font-semibold text-foreground">Reminders</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex rounded-lg border border-border overflow-hidden">
                            {filterOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFilter(opt.id)}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium transition-colors",
                                        filter === opt.id
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-surface text-muted hover:bg-surface-secondary",
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setCreateOpen(true)}
                        >
                            <Plus className="size-3.5" />
                            Add reminder
                        </Button>
                    </div>
                </div>

                <div className="p-5 space-y-2">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-16 rounded-xl bg-surface-secondary animate-pulse"
                            />
                        ))
                    ) : reminders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Bell className="size-8 text-muted/40 mb-3" />
                            <p className="text-sm font-medium text-foreground">No reminders yet</p>
                            <p className="text-xs text-muted mt-1">
                                Add a reminder to schedule a follow-up for this contact.
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="mt-4"
                                onPress={() => setCreateOpen(true)}
                            >
                                <Plus className="size-3.5" />
                                Add first reminder
                            </Button>
                        </div>
                    ) : (
                        reminders.map((reminder) => (
                            <ReminderRow key={reminder.uuid} reminder={reminder} />
                        ))
                    )}
                </div>
            </div>

            <ReminderFormModal
                contactUuid={contactUuid}
                isOpen={createOpen}
                onOpenChange={setCreateOpen}
            />
        </div>
    );
}
