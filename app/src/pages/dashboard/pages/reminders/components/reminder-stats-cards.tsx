import { Bell, CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReminderStats } from "@/features/reminders/interfaces/reminder.interface";

interface StatCardProps {
    label: string;
    value: number | undefined;
    iconBg: string;
    iconText: string;
    icon: React.ElementType;
}

function StatCard({ label, value, iconBg, iconText, icon: Icon }: StatCardProps) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-4">
            <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg", iconBg, iconText)}>
                <Icon className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums text-foreground leading-none">
                    {value ?? "—"}
                </p>
                <p className="text-xs text-muted mt-0.5 truncate">{label}</p>
            </div>
        </div>
    );
}

interface ReminderStatsCardsProps {
    stats: ReminderStats | undefined;
    isLoading: boolean;
}

export function ReminderStatsCards({ stats, isLoading }: ReminderStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[72px] rounded-xl bg-surface-secondary animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
                label="Pending"
                value={stats?.pending}
                iconBg="bg-accent/10"
                iconText="text-accent"
                icon={Clock}
            />
            <StatCard
                label="Due Today"
                value={stats?.due_today}
                iconBg="bg-orange-500/10"
                iconText="text-orange-500"
                icon={Bell}
            />
            <StatCard
                label="Overdue"
                value={stats?.overdue}
                iconBg="bg-red-500/10"
                iconText="text-red-500"
                icon={TriangleAlert}
            />
            <StatCard
                label="Done This Week"
                value={stats?.completed_this_week}
                iconBg="bg-green-500/10"
                iconText="text-green-500"
                icon={CheckCircle2}
            />
        </div>
    );
}
