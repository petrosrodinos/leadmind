import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { REDIS_OPTIONS } from '@/core/databases/redis/redis.constants';
import { OpenAiBatchDispatchService } from '@/modules/webhooks/services/openai-batch-dispatch.service';
import { ListBatchJobsDto } from './dto/list-batch-jobs.dto';
import {
    SystemServiceStatuses,
    type SystemServiceHealth,
    type SystemStatusResponse,
} from './interfaces/system-status.interface';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly openAiBatchDispatchService: OpenAiBatchDispatchService,
        @Inject(REDIS_OPTIONS) private readonly redisOptions: RedisOptions | null,
    ) { }

    getSystemStatus(): Promise<SystemStatusResponse> {
        return Promise.all([
            Promise.resolve(this.getApiHealth()),
            this.getDatabaseHealth(),
            this.getRedisHealth(),
        ]).then(([api, database, redis]) => ({ api, database, redis }));
    }

    private getApiHealth() {
        return {
            status: SystemServiceStatuses.UP,
            latency_ms: 0,
            uptime_seconds: Math.floor(process.uptime()),
        };
    }

    private async getDatabaseHealth(): Promise<SystemServiceHealth> {
        const startedAt = Date.now();

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: SystemServiceStatuses.UP,
                latency_ms: Date.now() - startedAt,
            };
        } catch (error) {
            return {
                status: SystemServiceStatuses.DOWN,
                latency_ms: null,
                message: error instanceof Error ? error.message : 'Database unreachable',
            };
        }
    }

    private async getRedisHealth(): Promise<SystemServiceHealth> {
        if (!this.redisOptions) {
            return {
                status: SystemServiceStatuses.NOT_CONFIGURED,
                latency_ms: null,
                message: 'REDIS_URL is not configured',
            };
        }

        const startedAt = Date.now();
        const redis = new Redis({
            ...this.redisOptions,
            lazyConnect: true,
            connectTimeout: 5_000,
            maxRetriesPerRequest: 1,
        });

        try {
            await redis.connect();
            await redis.ping();
            return {
                status: SystemServiceStatuses.UP,
                latency_ms: Date.now() - startedAt,
            };
        } catch (error) {
            return {
                status: SystemServiceStatuses.DOWN,
                latency_ms: null,
                message: error instanceof Error ? error.message : 'Redis unreachable',
            };
        } finally {
            redis.disconnect();
        }
    }

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

    async syncBatchJob(batchId: string) {
        await this.openAiBatchDispatchService.processBatchCompletion(batchId);
        return this.prisma.openAiBatchJob.findUnique({
            where: { batch_id: batchId },
            include: { user: { select: { uuid: true, email: true } } },
        });
    }
}
