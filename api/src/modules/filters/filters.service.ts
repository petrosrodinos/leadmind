import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, Filter, ScoringInstruction, SourceType } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { ScoringInstructionsService } from '@/modules/scoring-instructions/scoring-instructions.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { ListJobsDto } from './dto/list-jobs.dto';

interface RepeatableJobMeta {
    queue_job_id: string;
    repeat_key: string;
    cron_schedule: string;
}

const filterScoringInclude = {
    filter_scoring_instructions: {
        orderBy: { created_at: 'asc' as const },
        include: { scoring_instruction: true },
    },
} satisfies Prisma.FilterInclude;

type FilterWithScoring = Prisma.FilterGetPayload<{ include: typeof filterScoringInclude }>;

export type FilterResponse = Omit<FilterWithScoring, 'filter_scoring_instructions'> & {
    scoring_instructions: ScoringInstruction[];
};

function mapFilter(filter: FilterWithScoring): FilterResponse {
    const { filter_scoring_instructions, ...rest } = filter;
    return {
        ...rest,
        scoring_instructions: filter_scoring_instructions.map((l) => l.scoring_instruction),
    };
}

@Injectable()
export class FiltersService {
    private readonly logger = new Logger(FiltersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly scoringInstructionsService: ScoringInstructionsService,
        @InjectQueue(FILTER_SCRAPE_QUEUE) private readonly scrapeQueue: Queue,
    ) {}

    async create(user_uuid: string, dto: CreateFilterDto): Promise<FilterResponse> {
        this.validateQueryConfig(dto.source_type, dto.query_config);
        const uuids = dto.scoring_instruction_uuids ?? [];
        await this.scoringInstructionsService.assertAllOwnedByUser(user_uuid, uuids);

        const filter = await this.prisma.filter.create({
            data: {
                user_uuid,
                name: dto.name,
                source_type: dto.source_type,
                query_config: dto.query_config,
                enabled: dto.enabled ?? true,
                cron_schedule: dto.cron_schedule,
                channels: dto.channels,
                outreach_instructions: dto.outreach_instructions,
                ...(dto.enrichment_sources !== undefined
                    ? { enrichment_sources: dto.enrichment_sources }
                    : {}),
                ...(uuids.length > 0 && {
                    filter_scoring_instructions: {
                        create: uuids.map((scoring_instruction_uuid) => ({ scoring_instruction_uuid })),
                    },
                }),
            },
            include: filterScoringInclude,
        });

        if (filter.enabled && filter.cron_schedule) {
            await this.addRepeatable(filter.uuid, filter.cron_schedule);
        }

        return mapFilter(filter);
    }

    async findAll(user_uuid: string): Promise<FilterResponse[]> {
        const rows = await this.prisma.filter.findMany({
            where: { user_uuid },
            orderBy: { created_at: 'desc' },
            include: filterScoringInclude,
        });
        return rows.map(mapFilter);
    }

    async findOne(user_uuid: string, uuid: string): Promise<FilterResponse> {
        const filter = await this.prisma.filter.findFirst({
            where: { uuid, user_uuid },
            include: filterScoringInclude,
        });
        if (!filter) throw new NotFoundException(`Filter ${uuid} not found`);
        return mapFilter(filter);
    }

    async update(user_uuid: string, uuid: string, dto: UpdateFilterDto): Promise<FilterResponse> {
        const existing = await this.prisma.filter.findFirst({ where: { uuid, user_uuid } });
        if (!existing) throw new NotFoundException(`Filter ${uuid} not found`);

        const next_source_type = dto.source_type ?? existing.source_type;
        const next_query_config = dto.query_config ?? (existing.query_config as Record<string, any>);
        if (dto.source_type !== undefined || dto.query_config !== undefined) {
            this.validateQueryConfig(next_source_type, next_query_config);
        }

        if (dto.scoring_instruction_uuids !== undefined) {
            await this.scoringInstructionsService.assertAllOwnedByUser(
                user_uuid,
                dto.scoring_instruction_uuids,
            );
        }

        const data: Prisma.FilterUpdateInput = {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.source_type !== undefined && { source_type: dto.source_type }),
            ...(dto.query_config !== undefined && { query_config: dto.query_config }),
            ...(dto.enabled !== undefined && { enabled: dto.enabled }),
            ...(dto.cron_schedule !== undefined && { cron_schedule: dto.cron_schedule }),
            ...(dto.channels !== undefined && { channels: dto.channels }),
            ...(dto.outreach_instructions !== undefined && {
                outreach_instructions: dto.outreach_instructions,
            }),
            ...(dto.enrichment_sources !== undefined && { enrichment_sources: dto.enrichment_sources }),
            ...(dto.scoring_instruction_uuids !== undefined && {
                filter_scoring_instructions: {
                    deleteMany: {},
                    create: dto.scoring_instruction_uuids.map((scoring_instruction_uuid) => ({
                        scoring_instruction_uuid,
                    })),
                },
            }),
        };

        const updated = await this.prisma.filter.update({
            where: { uuid },
            data,
        });

        await this.syncRepeatable(existing, updated);

        return this.findOne(user_uuid, uuid);
    }

    async remove(user_uuid: string, uuid: string): Promise<{ uuid: string }> {
        const existing = await this.prisma.filter.findFirst({ where: { uuid, user_uuid } });
        if (!existing) throw new NotFoundException(`Filter ${uuid} not found`);

        if (existing.cron_schedule) {
            await this.removeRepeatable(existing.uuid, existing.cron_schedule);
        }

        await this.prisma.filter.delete({ where: { uuid } });

        return { uuid };
    }

    async manualRun(user_uuid: string, uuid: string): Promise<{
        queue_job_id: string;
        filter_uuid: string;
        status: 'queued';
    }> {
        const filter = await this.prisma.filter.findFirst({ where: { uuid, user_uuid } });
        if (!filter) throw new NotFoundException(`Filter ${uuid} not found`);

        if (filter.source_type === SourceType.MANUAL) {
            throw new BadRequestException('MANUAL filters cannot be run');
        }

        const job = await this.scrapeQueue.add(
            this.jobName(filter.uuid),
            { filter_uuid: filter.uuid, manual: true },
            { removeOnComplete: 100, removeOnFail: 100 },
        );

        return {
            queue_job_id: String(job.id),
            filter_uuid: filter.uuid,
            status: 'queued',
        };
    }

    async findJobs(user_uuid: string, uuid: string, query: ListJobsDto) {
        await this.findOne(user_uuid, uuid);

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.filterJob.findMany({
                where: { filter_uuid: uuid },
                orderBy: { started_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.filterJob.count({ where: { filter_uuid: uuid } }),
        ]);

        return { items, total, page, limit };
    }

    private async syncRepeatable(previous: Filter, next: Filter): Promise<void> {
        const was_active = previous.enabled && Boolean(previous.cron_schedule);
        const is_active = next.enabled && Boolean(next.cron_schedule);

        if (was_active) {
            await this.removeRepeatable(previous.uuid, previous.cron_schedule!);
        }
        if (is_active) {
            await this.addRepeatable(next.uuid, next.cron_schedule!);
        }
    }

    private async addRepeatable(filter_uuid: string, cron_schedule: string): Promise<RepeatableJobMeta> {
        const job = await this.scrapeQueue.add(
            this.jobName(filter_uuid),
            { filter_uuid },
            { repeat: { pattern: cron_schedule } },
        );

        const repeat_key = job.repeatJobKey ?? `${this.jobName(filter_uuid)}:::${cron_schedule}`;

        this.logger.log(`Scheduled repeatable job ${this.jobName(filter_uuid)} (${cron_schedule})`);

        return {
            queue_job_id: String(job.id),
            repeat_key,
            cron_schedule,
        };
    }

    private async removeRepeatable(filter_uuid: string, cron_schedule: string): Promise<void> {
        try {
            await this.scrapeQueue.removeRepeatable(this.jobName(filter_uuid), {
                pattern: cron_schedule,
            });
            this.logger.log(`Removed repeatable job ${this.jobName(filter_uuid)} (${cron_schedule})`);
        } catch (error) {
            this.logger.warn(
                `Failed to remove repeatable job for ${filter_uuid}: ${(error as Error).message}`,
            );
        }
    }

    private jobName(filter_uuid: string): string {
        return `filter-scrape:${filter_uuid}`;
    }

    private validateQueryConfig(source_type: SourceType, query_config: Record<string, any>): void {
        if (!query_config || typeof query_config !== 'object') {
            throw new BadRequestException('query_config must be an object');
        }

        switch (source_type) {
            case SourceType.LINKEDIN: {
                const kw = query_config.keywords;
                if (typeof kw !== 'string' || !kw.trim()) {
                    throw new BadRequestException(
                        `${SourceType.LINKEDIN} filter requires query_config.keywords (non-empty string)`,
                    );
                }
                return;
            }
            case SourceType.GOOGLE_MAPS:
                if (!query_config.query) {
                    throw new BadRequestException(
                        `${SourceType.GOOGLE_MAPS} filter requires query_config.query`,
                    );
                }
                return;
            case SourceType.GOOGLE_SEARCH:
                if (!query_config.queries) {
                    throw new BadRequestException(
                        `${SourceType.GOOGLE_SEARCH} filter requires query_config.queries`,
                    );
                }
                return;
            case SourceType.WEBSITE_CRAWLER:
                if (!Array.isArray(query_config.start_urls) || query_config.start_urls.length === 0) {
                    throw new BadRequestException(
                        `${SourceType.WEBSITE_CRAWLER} filter requires query_config.start_urls (non-empty array)`,
                    );
                }
                return;
            case SourceType.GENERIC_LEAD:
            case SourceType.GEMI:
            case SourceType.MANUAL:
                return;
            default: {
                const _exhaustive: never = source_type;
                throw new BadRequestException(`Unsupported source_type: ${_exhaustive}`);
            }
        }
    }
}
