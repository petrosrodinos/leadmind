import { Contact, Lead, Prisma, SourceType } from '@/generated/prisma';

export type EnrichmentProfileUpdate = {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    google_maps_url?: string;
    linkedin_url?: string;
    title?: string;
    location?: string;
    industry?: string;
    description?: string;
};

export type EnrichmentSubject = {
    uuid: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
    google_maps_url: string | null;
    linkedin_url: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    description: string | null;
    source_type: SourceType;
    raw_data: Prisma.JsonValue | null;
};

export function leadToEnrichmentSubject(lead: Lead): EnrichmentSubject {
    return {
        uuid: lead.uuid,
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
        source_type: lead.source_type,
        raw_data: lead.raw_data,
    };
}

export function contactToEnrichmentSubject(contact: Contact, lead: Lead): EnrichmentSubject {
    return {
        uuid: contact.uuid,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        website: contact.website,
        google_maps_url: contact.google_maps_url,
        linkedin_url: contact.linkedin_url,
        title: contact.title,
        location: contact.location,
        industry: contact.industry,
        description: contact.description,
        source_type: lead.source_type,
        raw_data: lead.raw_data,
    };
}

export function subjectHasAiResearchSeed(subject: EnrichmentSubject): boolean {
    return Boolean(
        subject.name?.trim() ||
            subject.company?.trim() ||
            subject.email?.trim() ||
            subject.linkedin_url?.trim() ||
            subject.website?.trim(),
    );
}

export function subjectAsLeadLike(subject: EnrichmentSubject): Lead {
    return {
        id: 0,
        uuid: subject.uuid,
        raw_lead_uuid: null,
        name: subject.name,
        email: subject.email,
        phone: subject.phone,
        company: subject.company,
        website: subject.website,
        google_maps_url: subject.google_maps_url,
        linkedin_url: subject.linkedin_url,
        title: subject.title,
        location: subject.location,
        industry: subject.industry,
        description: subject.description,
        source_type: subject.source_type,
        raw_data: subject.raw_data,
        enrichment_summary: null,
        enrichment_metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
    };
}

export function profileUpdateToLeadInput(
    update: EnrichmentProfileUpdate,
): Prisma.LeadUpdateInput {
    return update;
}

export function profileUpdateToContactInput(
    update: EnrichmentProfileUpdate,
): Prisma.ContactUpdateInput {
    return update;
}
