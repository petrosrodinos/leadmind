export const splitCsv = (s: string | undefined): string[] | undefined => {
    if (!s) return undefined;
    const arr = s
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    return arr.length > 0 ? arr : undefined;
};

export const joinCsv = (arr: unknown): string => {
    if (Array.isArray(arr)) return arr.filter((v) => typeof v === "string").join(", ");
    return "";
};

export const asStringArray = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string");
};
