export const FORM_DETAIL_TABS = [
    { id: "builder", label: "Form Builder" },
    { id: "completions", label: "Completions" },
] as const;

export type FormDetailTabId = (typeof FORM_DETAIL_TABS)[number]["id"];
