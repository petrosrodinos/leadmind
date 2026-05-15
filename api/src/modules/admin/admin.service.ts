import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ListBatchJobsDto } from './dto/list-batch-jobs.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async listBatchJobs(dto: ListBatchJobsDto) {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 20;
        const skip = (page - 1) * limit;

        const where = {
            ...(dto.type ? { type: dto.type } : {}),
            ...(dto.status ? { status: dto.status } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.openAiBatchJob.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { uuid: true, email: true } },
                },
            }),
            this.prisma.openAiBatchJob.count({ where }),
        ]);

        return { data, total, page, limit };
    }
}
