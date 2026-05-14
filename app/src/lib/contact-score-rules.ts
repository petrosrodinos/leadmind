import type { ContactScoreRule } from "@/features/contacts/interfaces/contact.interface";

export function parseScoreRulesParam(raw: string | null): ContactScoreRule[] {
    if (!raw?.trim()) return [];
    try {
        const decoded = decodeURIComponent(raw);
        const v = JSON.parse(decoded) as unknown;
        if (!Array.isArray(v)) return [];
        const out: ContactScoreRule[] = [];
        for (const item of v) {
            if (!item || typeof item !== "object") continue;
            const o = item as Record<string, unknown>;
            const id = o.scoring_instruction_uuid;
            const min = o.min;
            if (typeof id !== "string" || !id) continue;
            const n = typeof min === "number" ? min : Number(min);
            if (!Number.isFinite(n) || n < 1 || n > 10) continue;
            out.push({ scoring_instruction_uuid: id, min: Math.round(n) });
        }
        return out;
    } catch {
        return [];
    }
}

export function serializeScoreRulesParam(rules: ContactScoreRule[]): string | undefined {
    if (!rules.length) return undefined;
    return encodeURIComponent(JSON.stringify(rules));
}
