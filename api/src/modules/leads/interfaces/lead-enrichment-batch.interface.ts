import { EnrichmentSource } from '@/generated/prisma';

export type LeadEnrichmentBatchPhase = 'source_summaries' | 'combined_summaries';

export interface LeadEnrichmentBatchLinkedInStaging {
    url: string;
    subtype: 'profile' | 'company';
    plain: Record<string, unknown>;
}

export interface LeadEnrichmentBatchWebsiteStaging {
    url: string;
    title: string | null;
    textSample: string | null;
    markdownSample: string | null;
}

export interface LeadEnrichmentBatchGoogleStaging {
    query: string;
    results: { title?: string; url?: string; snippet?: string }[];
}

export interface LeadEnrichmentBatchAiStaging {
    websiteExcerpt: string | null;
    linkedinExcerpt: string | null;
    googleExcerpt: string | null;
}

export interface LeadEnrichmentBatchLeadStaging {
    linkedin?: LeadEnrichmentBatchLinkedInStaging;
    website?: LeadEnrichmentBatchWebsiteStaging;
    google?: LeadEnrichmentBatchGoogleStaging;
    ai?: LeadEnrichmentBatchAiStaging;
}

export interface LeadEnrichmentBatchContext {
    phase: LeadEnrichmentBatchPhase;
    user_uuid: string;
    lead_uuids: string[];
    sources: EnrichmentSource[];
    staging: Record<string, LeadEnrichmentBatchLeadStaging>;
    parent_batch_id?: string;
}
