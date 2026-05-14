import { Queue } from 'bullmq';
import { EnrichmentSource } from '@/generated/prisma';

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
