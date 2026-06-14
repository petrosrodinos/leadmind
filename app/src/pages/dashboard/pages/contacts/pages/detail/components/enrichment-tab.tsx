import { EnrichmentTabContent } from "@/components/ui/enrichment-tab-content";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";

interface ContactEnrichmentTabProps {
    contact: Contact;
}

export function ContactEnrichmentTab({ contact }: ContactEnrichmentTabProps) {
    return (
        <EnrichmentTabContent
            entityKind="contact"
            entityUuid={contact.uuid}
            summary={contact.enrichment_summary ?? contact.lead.enrichment_summary}
            metadata={
                (contact.enrichment_metadata as Record<string, unknown> | null | undefined) ??
                (contact.lead.enrichment_metadata as Record<string, unknown> | null | undefined)
            }
            sourceType={contact.lead.source_type}
        />
    );
}
