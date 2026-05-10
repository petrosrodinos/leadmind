import { EnrichmentSource } from "@/generated/prisma";

export type AiProcessAction = 'enrich' | 'score' | 'draft';

export interface ContactJobData {
    contact_uuid: string;
    action?: AiProcessAction;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
}

export interface LeadJobData {
    lead_uuid: string;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
}

export type AiProcessJobData = ContactJobData | LeadJobData;