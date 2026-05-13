import { Chip } from "@heroui/react";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_LABEL } from "@/features/contacts/constants/contacts.constants";

const STATUS_COLOR: Record<LeadStatus, "default" | "success" | "warning" | "danger"> = {
  [LeadStatus.NEW]: "default",
  [LeadStatus.CONTACTED]: "warning",
  [LeadStatus.CONVERTED]: "success",
  [LeadStatus.ARCHIVED]: "danger",
};

export function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <Chip size="sm" variant="soft" color={STATUS_COLOR[status]}>
      <Chip.Label>{STATUS_LABEL[status]}</Chip.Label>
    </Chip>
  );
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) {
    return <span className="inline-flex items-center justify-center min-w-9 h-6 rounded-md bg-surface-secondary text-muted text-xs font-medium px-2">—</span>;
  }

  const tone = score >= 7 ? "bg-success-soft text-success-soft-foreground" : score >= 4 ? "bg-warning-soft text-warning-soft-foreground" : "bg-danger-soft text-danger-soft-foreground";

  return <span className={`inline-flex items-center justify-center min-w-9 h-6 rounded-md text-xs font-semibold px-2 ${tone}`}>{score}/10</span>;
}
