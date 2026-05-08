/** Apify accepts these exact strings — the labels in `REVENUE_LABELS` are what we display. */
export const REVENUES = [
    "< 1M",
    "1M-10M",
    "11M-100M",
    "101M-500M",
    "501M-1B",
    "1B+",
] as const;

export type Revenue = (typeof REVENUES)[number];

export const REVENUE_LABELS: Record<Revenue, string> = {
    "< 1M": "Less than 1M",
    "1M-10M": "1M-10M",
    "11M-100M": "11M-100M",
    "101M-500M": "101M-500M",
    "501M-1B": "501M-1B",
    "1B+": "1B+",
};
