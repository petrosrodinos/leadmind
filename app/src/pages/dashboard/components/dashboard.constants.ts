export { EMPTY_BY_STATUS, STATUS_BAR_COLOR } from "@/features/contacts/constants/contacts.constants";

export const KPI_TONE: Record<"accent" | "success" | "warning" | "draft", { bg: string; text: string; bar: string }> = {
  accent: { bg: "bg-accent/10", text: "text-accent", bar: "bg-accent" },
  success: { bg: "bg-success-soft/40", text: "text-success-soft-foreground", bar: "bg-success" },
  warning: { bg: "bg-warning-soft/40", text: "text-warning-soft-foreground", bar: "bg-warning" },
  draft: { bg: "bg-accent/10", text: "text-accent", bar: "bg-accent/60" },
};
