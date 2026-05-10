import { EnrichmentSource } from "@/generated/prisma";
import { ContactJobData, LeadJobData, AiProcessJobData } from "../interfaces/workers.interfaces";

export const isLeadJob = (data: AiProcessJobData): data is LeadJobData =>
    'lead_uuid' in data && data.lead_uuid != null;

export function resolveContactEnrichmentSources(
    job: ContactJobData,
    filter: { enrichment_sources: EnrichmentSource[] } | null | undefined,
): EnrichmentSource[] {
    if (Array.isArray(job.enrichment_sources)) {
        return job.enrichment_sources;
    }
    if (filter?.enrichment_sources?.length) {
        return filter.enrichment_sources;
    }
    return [];
}
