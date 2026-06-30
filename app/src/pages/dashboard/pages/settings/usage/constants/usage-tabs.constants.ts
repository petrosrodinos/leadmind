export const USAGE_PAGE_LIMIT = 20;

export type UsageTabId = "ai" | "apify";

export const USAGE_TABS: { id: UsageTabId; label: string }[] = [
    { id: "ai", label: "AI" },
    { id: "apify", label: "Apify" },
];

export const USAGE_TAB_PARAM = "tab";

export const USAGE_TAB_CLASS =
    "px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap inline-flex items-center gap-1.5";
