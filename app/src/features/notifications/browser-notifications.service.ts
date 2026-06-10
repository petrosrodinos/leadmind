import type { Reminder } from "@/features/reminders/interfaces/reminder.interface";

export type NotificationPermission = "granted" | "denied" | "default";

export const getBrowserNotificationPermission = (): NotificationPermission => {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
};

export const requestBrowserNotificationPermission =
    async (): Promise<NotificationPermission> => {
        if (!("Notification" in window)) return "denied";
        if (Notification.permission === "granted") return "granted";
        if (Notification.permission === "denied") return "denied";
        const result = await Notification.requestPermission();
        return result;
    };

export const showReminderNotification = (reminder: Reminder): void => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const contactLabel =
        reminder.contact?.company ?? reminder.contact?.name ?? "Contact";
    const title = `Reminder: ${reminder.title ?? "Follow-up"}`;
    const body = `Contact: ${contactLabel}`;

    const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: `reminder-${reminder.uuid}`,
        requireInteraction: true,
    });

    notification.onclick = () => {
        window.focus();
        window.location.hash = `#/dashboard/contacts/${reminder.contact_uuid}`;
        notification.close();
    };
};
