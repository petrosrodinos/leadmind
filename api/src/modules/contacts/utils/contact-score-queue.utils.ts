import { BadRequestException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

export async function enqueueContactScoreJob(
    queue: Queue,
    prisma: PrismaService,
    contactUuid: string,
    allowed: string[],
    scoringInstructionUuidsRequested?: string[],
): Promise<{ jobId: string }> {
    if (allowed.length === 0) {
        throw new BadRequestException('This filter has no scoring instructions to rescore.');
    }
    const requestedRaw = scoringInstructionUuidsRequested?.filter(Boolean) ?? [];
    const requested =
        requestedRaw.length > 0 ? [...new Set(requestedRaw)] : allowed;
    for (const id of requested) {
        if (!allowed.includes(id)) {
            throw new BadRequestException(
                `Scoring instruction ${id} is not attached to this contact's filter.`,
            );
        }
    }
    await prisma.contactScore.deleteMany({
        where: {
            contact_uuid: contactUuid,
            scoring_instruction_uuid: { in: requested },
        },
    });
    const jobPayload: {
        contact_uuid: string;
        action: 'score';
        scoring_instruction_uuids?: string[];
    } = { contact_uuid: contactUuid, action: 'score' as const };
    if (requested.length < allowed.length) {
        jobPayload.scoring_instruction_uuids = requested;
    }
    const job = await queue.add(`contact-score:${contactUuid}`, jobPayload, {
        removeOnComplete: 100,
        removeOnFail: 100,
    });
    return { jobId: String(job.id) };
}
