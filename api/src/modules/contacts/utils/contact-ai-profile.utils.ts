import { Contact, Lead } from '@/generated/prisma';

export function formatContactForAi(contact: Contact, lead: Lead): string {
    const enrichment_summary = lead.enrichment_summary?.trim() ?? '';

    return [
        `Name: ${contact.name ?? 'N/A'}`,
        `Title: ${contact.title ?? 'N/A'}`,
        `Company: ${contact.company ?? 'N/A'}`,
        `Industry: ${contact.industry ?? 'N/A'}`,
        `Location: ${contact.location ?? 'N/A'}`,
        `Website: ${contact.website ?? 'N/A'}`,
        `Google Maps: ${contact.google_maps_url ?? 'N/A'}`,
        `Email: ${contact.email ?? 'N/A'}`,
        `Phone: ${contact.phone ?? 'N/A'}`,
        `LinkedIn: ${contact.linkedin_url ?? 'N/A'}`,
        `Description: ${contact.description ?? 'N/A'}`,
        enrichment_summary ? `Website summary: ${enrichment_summary}` : '',
    ]
        .filter(Boolean)
        .join('\n');
}
