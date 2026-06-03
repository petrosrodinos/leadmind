import { EnrichmentSource } from "@/generated/prisma";
import {
    ContactJobData,
    LeadJobData,
    LeadBatchEnrichPrepareJobData,
    AiProcessJobData,
} from "../interfaces/workers.interfaces";
import {
    resolveContactEnrichmentSources as resolveContactSourceList,
    resolveLeadEnrichmentSources,
} from '@/modules/leads/utils/enrichment-sources.utils';

export const isLeadBatchEnrichPrepareJob = (
    data: AiProcessJobData,
): data is LeadBatchEnrichPrepareJobData =>
    'job_kind' in data && data.job_kind === 'lead_batch_enrich_prepare';

export const isLeadJob = (data: AiProcessJobData): data is LeadJobData =>
    'lead_uuid' in data && data.lead_uuid != null && !isLeadBatchEnrichPrepareJob(data);

export function resolveContactEnrichmentSources(
    job: ContactJobData,
    filter: { enrichment_sources: EnrichmentSource[] } | null | undefined,
): EnrichmentSource[] {
    return resolveContactSourceList(job.enrichment_sources, filter);
}

export function resolveLeadJobEnrichmentSources(job: LeadJobData): EnrichmentSource[] {
    return resolveLeadEnrichmentSources(job.enrichment_sources);
}
