import { Lead } from '@/generated/prisma';

const CONTACT_PROFILE_KEYS = [
    'name',
    'email',
    'phone',
    'company',
    'website',
    'google_maps_url',
    'linkedin_url',
    'title',
    'location',
    'industry',
    'description',
] as const;

export function contactProfileFromLead(
    lead: Pick<
        Lead,
        | 'name'
        | 'email'
        | 'phone'
        | 'company'
        | 'website'
        | 'google_maps_url'
        | 'linkedin_url'
        | 'title'
        | 'location'
        | 'industry'
        | 'description'
    >,
) {
    const name = lead.name?.trim() || lead.company?.trim() || null;

    return {
        name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        website: lead.website,
        google_maps_url: lead.google_maps_url,
        linkedin_url: lead.linkedin_url,
        title: lead.title,
        location: lead.location,
        industry: lead.industry,
        description: lead.description,
    };
}

export function fillEmptyContactProfileFromLead(
    existing: Partial<Record<(typeof CONTACT_PROFILE_KEYS)[number], string | null>>,
    lead: Parameters<typeof contactProfileFromLead>[0],
): Partial<ReturnType<typeof contactProfileFromLead>> {
    const incoming = contactProfileFromLead(lead);
    const patch: Partial<ReturnType<typeof contactProfileFromLead>> = {};
    for (const key of CONTACT_PROFILE_KEYS) {
        const next = incoming[key];
        const current = existing[key];
        if (next != null && next !== '' && (current == null || current === '')) {
            patch[key] = next;
        }
    }
    return patch;
}
