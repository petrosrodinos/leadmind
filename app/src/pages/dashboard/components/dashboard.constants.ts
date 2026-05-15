import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";

export const EMPTY_BY_STATUS: Record<LeadStatus, number> = {
  [LeadStatus.NEW]: 0,
  [LeadStatus.CONTACTED]: 0,
  [LeadStatus.CONVERTED]: 0,
  [LeadStatus.ARCHIVED]: 0,
};

export const STATUS_BAR_COLOR: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "bg-accent",
  [LeadStatus.CONTACTED]: "bg-warning",
  [LeadStatus.CONVERTED]: "bg-success",
  [LeadStatus.ARCHIVED]: "bg-muted",
};

export const KPI_TONE: Record<"accent" | "success" | "warning" | "draft", { bg: string; text: string; bar: string }> = {
  accent: { bg: "bg-accent/10", text: "text-accent", bar: "bg-accent" },
  success: { bg: "bg-success-soft/40", text: "text-success-soft-foreground", bar: "bg-success" },
  warning: { bg: "bg-warning-soft/40", text: "text-warning-soft-foreground", bar: "bg-warning" },
  draft: { bg: "bg-accent/10", text: "text-accent", bar: "bg-accent/60" },
};
