import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import {
    getBrowserNotificationPermission,
    requestBrowserNotificationPermission,
} from "@/features/notifications/browser-notifications.service";

export function NotificationPermissionBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!("Notification" in window)) return;
        if (getBrowserNotificationPermission() === "default") {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    const handleEnable = async () => {
        const result = await requestBrowserNotificationPermission();
        if (result !== "default") setVisible(false);
    };

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm mb-4">
            <Bell className="size-4 shrink-0 text-accent" />
            <p className="flex-1 text-sm text-foreground">
                Enable browser notifications to get alerted when a reminder is due.
            </p>
            <button
                type="button"
                onClick={handleEnable}
                className="shrink-0 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
            >
                Enable
            </button>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="shrink-0 rounded-md p-1 text-muted hover:text-foreground transition-colors"
                aria-label="Dismiss"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}
