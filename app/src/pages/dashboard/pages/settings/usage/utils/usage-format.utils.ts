export function formatUsageDate(iso: string): string {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatUsageCost(value: number | null | undefined): string {
    if (value == null) return "—";
    if (value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    return `$${value.toFixed(4)}`;
}

export function formatUsageCount(value: number | null | undefined): string {
    if (value == null) return "—";
    return value.toLocaleString();
}

export function formatUsageDuration(ms: number | null | undefined): string {
    if (ms == null) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
