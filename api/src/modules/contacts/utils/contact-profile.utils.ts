import { Lead } from '@/generated/prisma';

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
    return {
        name: lead.name,
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
