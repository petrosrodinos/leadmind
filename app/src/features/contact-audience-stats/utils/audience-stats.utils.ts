export function audienceRate(numerator: number, denominator: number): number | null {
    if (denominator <= 0) return null;
    return Math.round((numerator / denominator) * 1000) / 10;
}

export function formatAudienceRate(rate: number | null): string {
    if (rate === null) return "—";
    return `${rate}%`;
}
