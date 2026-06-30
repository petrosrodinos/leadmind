import { Injectable, Logger } from '@nestjs/common';
import {
    AiUsageOperation,
    AiUsageRequestMode,
    AiUsageStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiUsageContext } from '@/integrations/ai/interfaces/ai.interface';
import { AICostResponse, AiProvider } from '@/integrations/ai/interfaces/ai.interface';
import { ListAiUsageDto, AiUsageSummaryDto } from './dto/list-ai-usage.dto';
import { CreateAiUsageLogInput, AiUsageSummaryResponse } from './interfaces/ai-usage.interface';

@Injectable()
export class AiUsageService {
    private readonly logger = new Logger(AiUsageService.name);

    constructor(private readonly prisma: PrismaService) {}

    log(input: CreateAiUsageLogInput): void {
        setImmediate(async () => {
            try {
                await this.prisma.aiUsageLog.create({
                    data: {
                        user_uuid: input.user_uuid,
                        provider: input.provider,
                        model: input.model,
                        operation: input.operation,
                        request_mode: input.request_mode ?? AiUsageRequestMode.SYNC,
                        status: input.status,
                        input_tokens: input.input_tokens ?? null,
                        output_tokens: input.output_tokens ?? null,
                        total_tokens: input.total_tokens ?? null,
                        input_cost_usd: input.input_cost_usd ?? null,
                        output_cost_usd: input.output_cost_usd ?? null,
                        total_cost_usd: input.total_cost_usd ?? null,
                        duration_ms: input.duration_ms ?? null,
                        reference_type: input.reference_type ?? null,
                        reference_uuid: input.reference_uuid ?? null,
                        batch_id: input.batch_id ?? null,
                        custom_id: input.custom_id ?? null,
                        error_message: input.error_message?.slice(0, 2000) ?? null,
                        metadata: input.metadata ?? undefined,
                    },
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Failed to persist AI usage log: ${message}`);
            }
        });
    }

    logFromSyncCall(params: {
        user_uuid: string;
        provider?: AiProvider;
        model?: string;
        usage?: AICostResponse;
        usageContext?: AiUsageContext;
        duration_ms?: number;
        status: AiUsageStatus;
        error_message?: string;
    }): void {
        const operation = this.resolveOperation(params.usageContext?.operation);
        this.log({
            user_uuid: params.user_uuid,
            provider: params.provider ?? 'openai',
            model: params.model ?? 'unknown',
            operation,
            request_mode: params.usageContext?.request_mode ?? AiUsageRequestMode.SYNC,
            status: params.status,
            input_tokens: params.usage?.inputTokens ?? null,
            output_tokens: params.usage?.outputTokens ?? null,
            total_tokens: params.usage?.totalTokens ?? null,
            input_cost_usd: params.usage?.inputCost ?? null,
            output_cost_usd: params.usage?.outputCost ?? null,
            total_cost_usd: params.usage?.totalCost ?? null,
            duration_ms: params.duration_ms ?? null,
            reference_type: params.usageContext?.reference_type ?? null,
            reference_uuid: params.usageContext?.reference_uuid ?? null,
            batch_id: params.usageContext?.batch_id ?? null,
            custom_id: params.usageContext?.custom_id ?? null,
            error_message: params.error_message ?? null,
            metadata: params.usageContext?.metadata as Prisma.InputJsonValue | undefined,
        });
    }

    logBatchResult(params: {
        user_uuid: string;
        model: string;
        operation: AiUsageOperation;
        input_tokens?: number | null;
        output_tokens?: number | null;
        total_tokens?: number | null;
        total_cost_usd?: number | null;
        batch_id: string;
        custom_id: string;
        status: AiUsageStatus;
        reference_type?: string | null;
        reference_uuid?: string | null;
        error_message?: string | null;
        metadata?: Prisma.InputJsonValue;
    }): void {
        this.log({
            user_uuid: params.user_uuid,
            provider: 'openai',
            model: params.model,
            operation: params.operation,
            request_mode: AiUsageRequestMode.BATCH,
            status: params.status,
            input_tokens: params.input_tokens ?? null,
            output_tokens: params.output_tokens ?? null,
            total_tokens: params.total_tokens ?? null,
            total_cost_usd: params.total_cost_usd ?? null,
            batch_id: params.batch_id,
            custom_id: params.custom_id,
            reference_type: params.reference_type ?? null,
            reference_uuid: params.reference_uuid ?? null,
            error_message: params.error_message ?? null,
            metadata: params.metadata,
        });
    }

    async findAll(user_uuid: string, dto: ListAiUsageDto) {
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.AiUsageLogWhereInput = {
            user_uuid,
            ...(dto.provider ? { provider: dto.provider } : {}),
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
            this.prisma.aiUsageLog.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.aiUsageLog.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map((row) => ({
                ...row,
                input_cost_usd: row.input_cost_usd ? Number(row.input_cost_usd) : null,
                output_cost_usd: row.output_cost_usd ? Number(row.output_cost_usd) : null,
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

    async getSummary(user_uuid: string, dto: AiUsageSummaryDto): Promise<AiUsageSummaryResponse> {
        const where: Prisma.AiUsageLogWhereInput = {
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

        const [aggregate, byProvider, byOperation, statusCounts] = await Promise.all([
            this.prisma.aiUsageLog.aggregate({
                where,
                _count: { _all: true },
                _sum: {
                    input_tokens: true,
                    output_tokens: true,
                    total_tokens: true,
                    total_cost_usd: true,
                },
            }),
            this.prisma.aiUsageLog.groupBy({
                by: ['provider'],
                where,
                _count: { _all: true },
                _sum: { total_cost_usd: true },
            }),
            this.prisma.aiUsageLog.groupBy({
                by: ['operation'],
                where,
                _count: { _all: true },
                _sum: { total_cost_usd: true },
            }),
            this.prisma.aiUsageLog.groupBy({
                by: ['status'],
                where,
                _count: { _all: true },
            }),
        ]);

        const successCount =
            statusCounts.find((row) => row.status === AiUsageStatus.SUCCESS)?._count._all ?? 0;
        const errorCount =
            statusCounts.find((row) => row.status === AiUsageStatus.ERROR)?._count._all ?? 0;

        return {
            total_requests: aggregate._count._all,
            successful_requests: successCount,
            failed_requests: errorCount,
            total_input_tokens: aggregate._sum.input_tokens ?? 0,
            total_output_tokens: aggregate._sum.output_tokens ?? 0,
            total_tokens: aggregate._sum.total_tokens ?? 0,
            total_cost_usd: Number(aggregate._sum.total_cost_usd ?? 0),
            by_provider: byProvider.map((row) => ({
                provider: row.provider,
                requests: row._count._all,
                total_cost_usd: Number(row._sum.total_cost_usd ?? 0),
            })),
            by_operation: byOperation.map((row) => ({
                operation: row.operation,
                requests: row._count._all,
                total_cost_usd: Number(row._sum.total_cost_usd ?? 0),
            })),
        };
    }

    private resolveOperation(operation?: string): AiUsageOperation {
        if (!operation) {
            return AiUsageOperation.OTHER;
        }
        const values = Object.values(AiUsageOperation) as string[];
        if (values.includes(operation)) {
            return operation as AiUsageOperation;
        }
        return AiUsageOperation.OTHER;
    }
}
