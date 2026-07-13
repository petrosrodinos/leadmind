import type { SendHistoryMessage } from "@/features/outreach/interfaces/send-history.interface";

export function formatSendHistoryDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getSendIntegrationLabel(message: SendHistoryMessage): string {
    if (message.channel === "SMS") {
        return message.sms_provider === "TWILIO" ? "Twilio" : "—";
    }

    if (message.email_provider === "SMTP") {
        return message.email_account ? `SMTP · Account ${message.email_account}` : "SMTP";
    }

    if (message.email_provider === "RESEND") {
        if (message.email_account === "env") return "Resend (env)";
        return message.email_account
            ? `Resend · Account ${message.email_account}`
            : "Resend";
    }

    return "—";
}

export function getContactDestination(message: SendHistoryMessage): string {
    if (message.channel === "EMAIL") {
        return message.contact.email ?? "—";
    }
    if (message.channel === "SMS") {
        return message.contact.phone ?? "—";
    }
    return message.contact.email ?? message.contact.phone ?? "—";
}
