import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { Button } from "@heroui/react";
import { useReminders, useReminderStats } from "@/features/reminders/hooks/use-reminders";
import type { Reminder } from "@/features/reminders/interfaces/reminder.interface";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";

function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function ReminderRowDot({ reminder }: { reminder: Reminder }) {
    const now = new Date();
    const target = new Date(reminder.remind_at);
    const isOverdue = target < now;
    const isToday = target.toDateString() === now.toDateString();

    return (
        <span
            className={cn(
                "inline-block size-1.5 rounded-full shrink-0 mt-1.5",
                isOverdue ? "bg-red-500" : isToday ? "bg-orange-400" : "bg-blue-400",
            )}
        />
    );
}

interface StatPillProps {
    label: string;
    value: number;
    tone: "blue" | "orange" | "red" | "green";
    icon: React.ElementType;
}

function StatPill({ label, value, tone, icon: Icon }: StatPillProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-700",
        orange: "bg-orange-50 text-orange-700",
        red: "bg-red-50 text-red-700",
        green: "bg-green-50 text-green-700",
    };
    return (
        <div className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5", colors[tone])}>
            <Icon className="size-3.5 shrink-0" />
            <span className="text-xs font-semibold tabular-nums">{value}</span>
            <span className="text-xs">{label}</span>
        </div>
    );
}

interface DashboardRemindersCardProps {
    isLoading?: boolean;
}

export function DashboardRemindersCard({ isLoading }: DashboardRemindersCardProps) {
    const navigate = useNavigate();
    const { data: stats } = useReminderStats();
    const { data: upcomingPage } = useReminders({ range: "week", limit: 20 });
    const upcoming = upcomingPage?.data ?? [];

    const displayItems = upcoming.slice(0, 5);

    return (
        <div className="rounded-2xl border border-border/80 bg-surface/80 flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <Bell className="size-4 text-muted" />
                    <h3 className="text-sm font-semibold text-foreground">Upcoming Reminders</h3>
                </div>
            </div>

            {stats && (
                <div className="flex flex-wrap gap-2 px-5 pt-3.5 pb-1">
                    <StatPill label="Pending" value={stats.pending} tone="blue" icon={Clock} />
                    <StatPill label="Today" value={stats.due_today} tone="orange" icon={Bell} />
                    <StatPill label="Overdue" value={stats.overdue} tone="red" icon={TriangleAlert} />
                    <StatPill
                        label="Done this week"
                        value={stats.completed_this_week}
                        tone="green"
                        icon={CheckCircle2}
                    />
                </div>
            )}

            <div className="px-5 py-3 flex-1">
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-10 rounded-lg bg-surface-secondary animate-pulse" />
                        ))}
                    </div>
                ) : displayItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Bell className="size-6 text-muted/40 mb-2" />
                        <p className="text-xs text-muted">No upcoming reminders this week.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {displayItems.map((reminder) => (
                            <li
                                key={reminder.uuid}
                                className="flex items-start gap-2 cursor-pointer group"
                                onClick={() =>
                                    navigate(`${Routes.dashboard.contacts}/${reminder.contact_uuid}`)
                                }
                            >
                                <ReminderRowDot reminder={reminder} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                                        {reminder.title ?? "Reminder"}
                                    </p>
                                    <p className="text-xs text-muted truncate">
                                        {reminder.contact?.company ??
                                            reminder.contact?.name ??
                                            "Contact"}{" "}
                                        · {formatShortDate(reminder.remind_at)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {upcoming.length > 5 && (
                <div className="border-t border-border/60 px-5 py-2.5">
                    <Button
                        size="sm"
                        variant="tertiary"
                        className="w-full text-xs text-muted"
                        onPress={() => navigate(Routes.dashboard.reminders)}
                    >
                        View all {upcoming.length} reminders
                    </Button>
                </div>
            )}
        </div>
    );
}
