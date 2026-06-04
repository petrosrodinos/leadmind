import { Chip } from "@heroui/react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact } from "@/pages/dashboard/pages/leads/components/badges";

interface AudiencePreviewTableProps {
    rows: Contact[];
    channels: Channel[];
    excluded: Set<string>;
    onToggleExclude: (uuid: string) => void;
}

export function AudiencePreviewTable({
    rows,
    channels,
    excluded,
    onToggleExclude,
}: AudiencePreviewTableProps) {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-8 text-center text-sm text-muted">
                No contacts match these filters.
            </div>
        );
    }
    return (
        <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead className="bg-surface-secondary/40 text-muted">
                    <tr>
                        <th className="w-8 px-3 py-2"></th>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Company</th>
                        <th className="px-3 py-2 text-left font-medium">Score</th>
                        <th className="px-3 py-2 text-left font-medium">Tags</th>
                        <th className="px-3 py-2 text-left font-medium">Eligibility</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((c) => {
                        const isExcluded = excluded.has(c.uuid);
                        return (
                            <tr
                                key={c.uuid}
                                className={`border-t border-border ${isExcluded ? "opacity-40" : ""}`}
                            >
                                <td className="px-3 py-2 align-top">
                                    <input
                                        type="checkbox"
                                        checked={!isExcluded}
                                        onChange={() => onToggleExclude(c.uuid)}
                                        aria-label={`Toggle ${c.name ?? "contact"} inclusion`}
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
                                <td className="px-3 py-2 align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {channels.includes(Channel.EMAIL) && (
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={c.email ? "success" : "default"}
                                            >
                                                <Chip.Label>
                                                    {c.email ? "EMAIL ✓" : "no email"}
                                                </Chip.Label>
                                            </Chip>
                                        )}
                                        {channels.includes(Channel.SMS) && (
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={c.phone ? "success" : "default"}
                                            >
                                                <Chip.Label>
                                                    {c.phone ? "SMS ✓" : "no phone"}
                                                </Chip.Label>
                                            </Chip>
                                        )}
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
