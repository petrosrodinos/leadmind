import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showReminderNotification } from "@/features/notifications/browser-notifications.service";
import { websocketSubscribe } from "@/features/websocket/services/websocket.service";
import { WEBSOCKET_EVENTS } from "@/features/websocket/interfaces/websocket-events.constants";
import type { Reminder } from "../interfaces/reminder.interface";
import { reminderQueryKeys } from "./use-reminders";

export function useReminderNotifications() {
    const qc = useQueryClient();

    // Permission is NOT requested automatically here — browsers block it without a
    // user gesture. Use <NotificationPermissionBanner> to let the user opt in.
    // We still read the current state so showReminderNotification() works if already granted.

    useEffect(() => {
        const invalidate = () => qc.invalidateQueries({ queryKey: reminderQueryKeys.all });

        const onTriggered = websocketSubscribe<Reminder>(
            WEBSOCKET_EVENTS.REMINDER.TRIGGERED,
            (reminder) => {
                showReminderNotification(reminder);
                invalidate();
            },
        );

        const onCreated = websocketSubscribe<Reminder>(
            WEBSOCKET_EVENTS.REMINDER.CREATED,
            () => invalidate(),
        );

        const onUpdated = websocketSubscribe<Reminder>(
            WEBSOCKET_EVENTS.REMINDER.UPDATED,
            () => invalidate(),
        );

        const onCompleted = websocketSubscribe<Reminder>(
            WEBSOCKET_EVENTS.REMINDER.COMPLETED,
            () => invalidate(),
        );

        const onDeleted = websocketSubscribe<{ uuid: string }>(
            WEBSOCKET_EVENTS.REMINDER.DELETED,
            () => invalidate(),
        );

        return () => {
            onTriggered.unsubscribe();
            onCreated.unsubscribe();
            onUpdated.unsubscribe();
            onCompleted.unsubscribe();
            onDeleted.unsubscribe();
        };
    }, [qc]);
}
