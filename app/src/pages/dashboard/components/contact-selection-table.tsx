import { Chip } from "@heroui/react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";

interface ContactSelectionTableProps {
    rows: Contact[];
    selected: Set<string>;
    onToggleSelect: (uuid: string) => void;
    onToggleAll?: (uuids: string[], select: boolean) => void;
}

export function ContactSelectionTable({
    rows,
    selected,
    onToggleSelect,
    onToggleAll,
}: ContactSelectionTableProps) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-8 text-center text-sm text-muted">
                No contacts match these filters.
            </div>
        );
    }

    const allSelected = rows.every((r) => selected.has(r.uuid));
    const someSelected = rows.some((r) => selected.has(r.uuid));

    return (
        <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead className="bg-surface-secondary/40 text-muted">
                    <tr>
                        <th className="w-8 px-3 py-2">
                            {onToggleAll ? (
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = someSelected && !allSelected;
                                    }}
                                    onChange={() =>
                                        onToggleAll(
                                            rows.map((r) => r.uuid),
                                            !allSelected,
                                        )
                                    }
                                    aria-label="Select all contacts on page"
                                />
                            ) : null}
                        </th>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Company</th>
                        <th className="px-3 py-2 text-left font-medium">Score</th>
                        <th className="px-3 py-2 text-left font-medium">Tags</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((c) => {
                        const isSelected = selected.has(c.uuid);
                        return (
                            <tr
                                key={c.uuid}
                                className={`border-t border-border ${isSelected ? "bg-accent/5" : ""}`}
                            >
                                <td className="px-3 py-2 align-top">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onToggleSelect(c.uuid)}
                                        aria-label={`Select ${c.name ?? "contact"}`}
                                    />
                                </td>
                                <td className="px-3 py-2 align-top">
                                    <div className="font-medium text-foreground">
                                        {c.name ?? "—"}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {c.email ?? c.phone ?? "—"}
                                    </div>
                                </td>
                                <td className="px-3 py-2 align-top text-foreground/90">
                                    {c.company ?? "—"}
                                </td>
                                <td className="px-3 py-2 align-top">
                                    <ContactScoresCompact contact={c} />
                                </td>
                                <td className="px-3 py-2 align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {(c.tags ?? []).slice(0, 3).map((t) => (
                                            <Chip key={t} size="sm" variant="soft" color="default">
                                                <Chip.Label>{t}</Chip.Label>
                                            </Chip>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
