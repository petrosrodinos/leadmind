import { Injectable, Logger } from '@nestjs/common';
import { ApifyUsageStatus, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ListApifyUsageDto, ApifyUsageSummaryDto } from './dto/list-apify-usage.dto';
import { ApifyUsageSummaryResponse, CreateApifyUsageLogInput } from './interfaces/apify-usage.interface';

@Injectable()
export class ApifyUsageService {
    private readonly logger = new Logger(ApifyUsageService.name);

    constructor(private readonly prisma: PrismaService) {}

    log(input: CreateApifyUsageLogInput): void {
        setImmediate(async () => {
            try {
                await this.prisma.apifyUsageLog.create({
                    data: {
                        user_uuid: input.user_uuid,
                        actor_id: input.actor_id,
                        operation: input.operation,
                        status: input.status,
                        result_count: input.result_count ?? null,
                        duration_ms: input.duration_ms ?? null,
                        compute_units: input.compute_units ?? null,
                        total_cost_usd: input.total_cost_usd ?? null,
                        run_id: input.run_id ?? null,
                        reference_type: input.reference_type ?? null,
                        reference_uuid: input.reference_uuid ?? null,
                        error_message: input.error_message?.slice(0, 2000) ?? null,
                        metadata: input.metadata ?? undefined,
                    },
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to persist Apify usage log: ${message}`);
            }
        });
    }

    async findAll(user_uuid: string, dto: ListApifyUsageDto) {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.ApifyUsageLogWhereInput = {
            user_uuid,
            ...(dto.actor_id ? { actor_id: dto.actor_id } : {}),
            ...(dto.operation ? { operation: dto.operation } : {}),
            ...(dto.status ? { status: dto.status } : {}),
            ...(dto.from || dto.to
                ? {
                      created_at: {
                          ...(dto.from ? { gte: new Date(dto.from) } : {}),
                          ...(dto.to ? { lte: new Date(dto.to) } : {}),
                      },
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.apifyUsageLog.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.apifyUsageLog.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map((row) => ({
                ...row,
                compute_units: row.compute_units ? Number(row.compute_units) : null,
                total_cost_usd: row.total_cost_usd ? Number(row.total_cost_usd) : null,
            })),
            pagination: {
                total,
                page,
                limit,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1,
            },
        };
    }

    async getSummary(user_uuid: string, dto: ApifyUsageSummaryDto): Promise<ApifyUsageSummaryResponse> {
        const where: Prisma.ApifyUsageLogWhereInput = {
            user_uuid,
            ...(dto.from || dto.to
                ? {
                      created_at: {
                          ...(dto.from ? { gte: new Date(dto.from) } : {}),
                          ...(dto.to ? { lte: new Date(dto.to) } : {}),
                      },
                  }
                : {}),
        };

        const [aggregate, byOperation, byActor, statusCounts] = await Promise.all([
            this.prisma.apifyUsageLog.aggregate({
                where,
                _count: { _all: true },
                _sum: {
                    result_count: true,
                    compute_units: true,
                    total_cost_usd: true,
                },
            }),
            this.prisma.apifyUsageLog.groupBy({
                by: ['operation'],
                where,
                _count: { _all: true },
                _sum: { total_cost_usd: true },
            }),
            this.prisma.apifyUsageLog.groupBy({
                by: ['actor_id'],
                where,
                _count: { _all: true },
                _sum: { total_cost_usd: true },
            }),
            this.prisma.apifyUsageLog.groupBy({
                by: ['status'],
                where,
                _count: { _all: true },
            }),
        ]);

        const successCount =
            statusCounts.find((row) => row.status === ApifyUsageStatus.SUCCESS)?._count._all ?? 0;
        const errorCount =
            statusCounts.find((row) => row.status === ApifyUsageStatus.ERROR)?._count._all ?? 0;

        return {
            total_requests: aggregate._count._all,
            successful_requests: successCount,
            failed_requests: errorCount,
            total_result_count: aggregate._sum.result_count ?? 0,
            total_compute_units: Number(aggregate._sum.compute_units ?? 0),
            total_cost_usd: Number(aggregate._sum.total_cost_usd ?? 0),
            by_operation: byOperation.map((row) => ({
                operation: row.operation,
                requests: row._count._all,
                total_cost_usd: Number(row._sum.total_cost_usd ?? 0),
            })),
            by_actor: byActor.map((row) => ({
                actor_id: row.actor_id,
                requests: row._count._all,
                total_cost_usd: Number(row._sum.total_cost_usd ?? 0),
            })),
        };
    }
}
