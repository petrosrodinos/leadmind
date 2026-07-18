import { Chip } from "@heroui/react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";

export function ContactAlsoFoundByHint({ contact }: { contact: Contact }) {
    const linked =
        contact.filters && contact.filters.length > 0
            ? contact.filters
            : [
                  ...(contact.filter?.uuid
                      ? [
                            {
                                uuid: contact.filter.uuid,
                                name: contact.filter.name ?? "Primary",
                            },
                        ]
                      : []),
                  ...(contact.also_found_by ?? []),
              ];

    if (linked.length <= 1) {
        return null;
    }

    const label = linked.map((f) => f.name).filter(Boolean).join(", ");

    return (
        <Chip
            size="sm"
            variant="secondary"
            className="max-w-full"
            title={label || undefined}
        >
            {linked.length} filters
        </Chip>
    );
}
