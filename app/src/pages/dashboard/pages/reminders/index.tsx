import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Input, ListBox, Select } from "@heroui/react";
import { Bell, Plus, Search } from "lucide-react";
import { ReminderFormModal } from "@/components/reminders";
import { NotificationPermissionBanner } from "@/components/ui/notification-permission-banner";
import { useReminders, useReminderStats } from "@/features/reminders/hooks/use-reminders";
import { useReminderNotifications } from "@/features/reminders/hooks/use-reminder-notifications";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ReminderStatus } from "@/features/reminders/interfaces/reminder.interface";
import { ReminderStatsCards } from "./components/reminder-stats-cards";
import { RemindersTable } from "./components/reminders-table";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { id: "", label: "All statuses" },
    { id: "PENDING", label: "Pending" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
];

const RANGE_OPTIONS = [
    { id: "", label: "All dates" },
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
    { id: "overdue", label: "Overdue" },
];

export default function RemindersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [createOpen, setCreateOpen] = useState(false);

    useReminderNotifications();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const search = searchParams.get("search") ?? "";
    const statusParam = searchParams.get("status") ?? "";
    const rangeParam = searchParams.get("range") ?? "";

    const updateParams = (next: Record<string, string | undefined | null>) => {
        const params = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(next)) {
            if (v == null || v === "") params.delete(k);
            else params.set(k, v);
        }
        setSearchParams(params, { replace: true });
    };

    const debouncedSearch = useDebouncedValue(search, 300);

    const status = (statusParam as ReminderStatus) || undefined;
    const range = (rangeParam as "today" | "week" | "month" | "all" | "overdue") || undefined;

    const { data: remindersPage, isLoading, isFetching } = useReminders({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status,
        range,
    });

    const { data: stats, isLoading: statsLoading } = useReminderStats();

    const reminders = remindersPage?.data ?? [];
    const total = remindersPage?.total ?? 0;
    const totalPages = remindersPage?.totalPages ?? 1;

    return (
        <div className="flex flex-col gap-5">
            <NotificationPermissionBanner />

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Bell className="size-5 text-muted" />
                    <h1 className="text-xl font-semibold text-foreground">Reminders</h1>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => setCreateOpen(true)}
                >
                    <Plus className="size-3.5" />
                    New Reminder
                </Button>
            </div>

            <ReminderStatsCards stats={stats} isLoading={statsLoading} />

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    className="max-w-xs"
                    placeholder="Search reminders…"
                    value={search}
                    onChange={(e) =>
                        updateParams({ search: e.target.value || null, page: "1" })
                    }
                    startContent={<Search className="size-3.5 text-muted" />}
                />

                <Select
                    aria-label="Filter by status"
                    value={statusParam}
                    onChange={(v) => updateParams({ status: v || null, page: "1" })}
                    className="w-40"
                >
                    <Select.Trigger>
                        <Select.Value placeholder="All statuses" />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            {STATUS_OPTIONS.map((opt) => (
                                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                    {opt.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>

                <Select
                    aria-label="Filter by date range"
                    value={rangeParam}
                    onChange={(v) => updateParams({ range: v || null, page: "1" })}
                    className="w-40"
                >
                    <Select.Trigger>
                        <Select.Value placeholder="All dates" />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            {RANGE_OPTIONS.map((opt) => (
                                <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                    {opt.label}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>

            <RemindersTable
                reminders={reminders}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
            />

            <ReminderFormModal
                isOpen={createOpen}
                onOpenChange={setCreateOpen}
            />
        </div>
    );
}
