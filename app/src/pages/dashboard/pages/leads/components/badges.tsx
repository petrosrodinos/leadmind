import { Chip } from "@heroui/react";
import type { Contact, ContactScoreRow } from "@/features/contacts/interfaces/contact.interface";
import type { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { STATUS_CHIP_COLOR, STATUS_LABEL } from "@/features/contacts/constants/contacts.constants";

export function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <Chip size="sm" variant="soft" color={STATUS_CHIP_COLOR[status]}>
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

export function maxContactScore(rows: ContactScoreRow[] | null | undefined): number | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return Math.max(...rows.map((r) => r.score));
}

function contactScoresTooltip(contact: Contact): string {
  const defs = contact.filter?.scoring_instructions ?? [];
  const scoreRows = Array.isArray(contact.contact_scores) ? contact.contact_scores : [];
  const byInstr = new Map(scoreRows.map((r) => [r.scoring_instruction_uuid, r.score]));
  if (defs.length > 0) {
    return defs
      .map((d) => {
        const s = byInstr.get(d.uuid);
        return s != null ? `${d.name}: ${s}/10` : `${d.name}: …`;
      })
      .join("\n");
  }
  const rows = scoreRows;
  if (!rows.length) return "";
  return rows.map((r) => `${r.score}/10`).join("\n");
}

export function ContactScoresCompact({ contact }: { contact: Contact }) {
  const max = maxContactScore(contact.contact_scores);
  const title = contactScoresTooltip(contact);
  return (
    <span title={title || undefined} className="inline-flex">
      <ScoreBadge score={max} />
    </span>
  );
}
