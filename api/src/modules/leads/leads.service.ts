import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Prisma, Lead } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { ListLeadsDto } from './dto/list-leads.dto';

@Injectable()
export class LeadsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue(AI_PROCESS_QUEUE) private readonly aiProcessQueue: Queue,
    ) { }

    async findAll(query: ListLeadsDto): Promise<{
        data: Lead[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.LeadWhereInput = {
            ...(query.source_type && { source_type: query.source_type }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                    { company: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.lead.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(uuid: string): Promise<Lead> {
        const lead = await this.prisma.lead.findUnique({ where: { uuid } });
        if (!lead) {
            throw new NotFoundException(`Lead ${uuid} not found`);
        }
        return lead;
    }

    async triggerEnrich(uuid: string): Promise<{ jobId: string }> {
        await this.findOne(uuid);
        const job = await this.aiProcessQueue.add(
            `lead-enrich:${uuid}`,
            { lead_uuid: uuid, action: 'enrich' as const },
            { removeOnComplete: 100, removeOnFail: 100 },
        );

        return { jobId: String(job.id) };
    }
}
