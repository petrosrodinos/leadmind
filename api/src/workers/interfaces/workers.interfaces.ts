import { EnrichmentSource } from "@/generated/prisma";

export type AiProcessAction = 'enrich' | 'score' | 'draft';

export interface ContactJobData {
    contact_uuid: string;
    action?: AiProcessAction;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
    scoring_instruction_uuids?: string[];
}

export interface LeadJobData {
    lead_uuid: string;
    enrichment_sources?: EnrichmentSource[];
    force_enrichment?: boolean;
}

export interface LeadBatchEnrichPrepareJobData {
    job_kind: 'lead_batch_enrich_prepare';
    user_uuid: string;
    lead_uuids: string[];
    enrichment_sources?: EnrichmentSource[];
}

export type AiProcessJobData = ContactJobData | LeadJobData | LeadBatchEnrichPrepareJobData;