import { Contact } from '@/generated/prisma';
import type { PlaceholderVars } from '@/shared/utils/placeholder-render.util';

export const CONTACT_PLACEHOLDER_KEYS = [
    'contact_first_name',
    'contact_last_name',
    'contact_name',
    'contact_company',
    'contact_title',
] as const;

export function contactToPlaceholders(contact: Contact): PlaceholderVars {
    const contactName = contact.name?.trim() ?? '';
    const nameParts = contactName.split(/\s+/).filter(Boolean);
    const contactFirstName = nameParts[0] ?? '';
    const contactLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
        contact_first_name: contactFirstName,
        contact_last_name: contactLastName,
        contact_name: contactName,
        contact_company: contact.company ?? '',
        contact_title: contact.title ?? '',
    };
}
