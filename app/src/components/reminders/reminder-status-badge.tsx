import { CheckCircle2, Clock } from "lucide-react";
import type { Reminder } from "@/features/reminders/interfaces/reminder.interface";

interface ReminderStatusBadgeProps {
    status: Reminder["status"];
}

export function ReminderStatusBadge({ status }: ReminderStatusBadgeProps) {
    if (status === "COMPLETED") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle2 className="size-3" />
                Completed
            </span>
        );
    }
    if (status === "CANCELLED") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-muted">
                Cancelled
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            <Clock className="size-3" />
            Pending
        </span>
    );
}
