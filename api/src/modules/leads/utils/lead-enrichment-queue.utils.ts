import { Queue } from 'bullmq';
import { EnrichmentSource } from '@/generated/prisma';
import type { LeadBatchEnrichPrepareJobData } from '@/workers/interfaces/workers.interfaces';

export async function enqueueLeadBatchEnrichPrepareJob(
    queue: Queue,
    user_uuid: string,
    lead_uuids: string[],
    enrichment_sources: EnrichmentSource[],
): Promise<{ jobId: string }> {
    const payload: LeadBatchEnrichPrepareJobData = {
        job_kind: 'lead_batch_enrich_prepare',
        user_uuid,
        lead_uuids,
        enrichment_sources,
    };
    const job = await queue.add('lead-batch-enrich-prepare', payload, {
        removeOnComplete: 100,
        removeOnFail: 100,
    });
    return { jobId: String(job.id) };
}

export async function enqueueLeadEnrichmentJob(
    queue: Queue,
    leadUuid: string,
    enrichment_sources: EnrichmentSource[],
): Promise<{ jobId: string }> {
    const job = await queue.add(
        `lead-enrich:${leadUuid}`,
        {
            lead_uuid: leadUuid,
            enrichment_sources,
            force_enrichment: true,
        },
        { removeOnComplete: 100, removeOnFail: 100 },
    );
    return { jobId: String(job.id) };
}
