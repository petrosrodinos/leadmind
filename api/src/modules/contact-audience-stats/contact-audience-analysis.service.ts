import { Injectable, NotFoundException } from '@nestjs/common';
import {
    ContactAudienceAnalysisScope,
    ContactAudienceAnalysisStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { ContactAudienceStatsService } from './contact-audience-stats.service';
import { ListContactAudienceAnalysesDto } from './dto/list-contact-audience-analyses.dto';
import {
    AUDIENCE_ANALYSIS_SYSTEM_PROMPT,
    buildAudienceAnalysisPrompt,
} from './constants/contact-audience-analysis-prompts';
import {
    CONTACT_AUDIENCE_ANALYSIS_SCHEMA,
    type ContactAudienceAnalysisContent,
} from './schemas/contact-audience-analysis.schema';
import type {
    ContactAudienceAnalysisRecord,
    PaginatedContactAudienceAnalyses,
} from './interfaces/contact-audience-analysis.interface';
import type { ContactAudienceStats } from './interfaces/contact-audience-stats.interface';

const analysisSelect = {
    uuid: true,
    scope: true,
    filter_uuid: true,
    contact_list_uuid: true,
    audience_name: true,
    stats_snapshot: true,
    analysis: true,
    status: true,
    error: true,
    provider: true,
    model: true,
    input_tokens: true,
    output_tokens: true,
    cost_usd: true,
    created_at: true,
    updated_at: true,
} satisfies Prisma.ContactAudienceAnalysisSelect;

type AnalysisRow = Prisma.ContactAudienceAnalysisGetPayload<{ select: typeof analysisSelect }>;

@Injectable()
export class ContactAudienceAnalysisService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactAudienceStatsService: ContactAudienceStatsService,
        private readonly aiService: AiService,
    ) {}

    async createFilterAnalysis(
        user_uuid: string,
        filterUuid: string,
    ): Promise<ContactAudienceAnalysisRecord> {
        const filter = await this.prisma.filter.findFirst({
            where: { uuid: filterUuid, user_uuid },
            select: { uuid: true, name: true },
        });
        if (!filter) throw new NotFoundException('Filter not found');

        const stats = await this.contactAudienceStatsService.getFilterStats(user_uuid, filterUuid, {});
        return this.runAnalysis({
            user_uuid,
            scope: ContactAudienceAnalysisScope.FILTER,
            filter_uuid: filter.uuid,
            contact_list_uuid: null,
            audience_name: filter.name,
            stats,
            scopeLabel: 'filter',
        });
    }

    async createListAnalysis(
        user_uuid: string,
        listUuid: string,
    ): Promise<ContactAudienceAnalysisRecord> {
        const list = await this.prisma.contactList.findFirst({
            where: { uuid: listUuid, user_uuid },
            select: { uuid: true, title: true },
        });
        if (!list) throw new NotFoundException('Contact list not found');

        const stats = await this.contactAudienceStatsService.getListStats(user_uuid, listUuid, {});
        return this.runAnalysis({
            user_uuid,
            scope: ContactAudienceAnalysisScope.LIST,
            filter_uuid: null,
            contact_list_uuid: list.uuid,
            audience_name: list.title,
            stats,
            scopeLabel: 'list',
        });
    }

    async listFilterAnalyses(
        user_uuid: string,
        filterUuid: string,
        query: ListContactAudienceAnalysesDto,
    ): Promise<PaginatedContactAudienceAnalyses> {
        await this.assertFilterOwnership(user_uuid, filterUuid);
        return this.listAnalyses(user_uuid, {
            scope: ContactAudienceAnalysisScope.FILTER,
            filter_uuid: filterUuid,
        }, query);
    }

    async listListAnalyses(
        user_uuid: string,
        listUuid: string,
        query: ListContactAudienceAnalysesDto,
    ): Promise<PaginatedContactAudienceAnalyses> {
        await this.assertListOwnership(user_uuid, listUuid);
        return this.listAnalyses(user_uuid, {
            scope: ContactAudienceAnalysisScope.LIST,
            contact_list_uuid: listUuid,
        }, query);
    }

    private async runAnalysis(input: {
        user_uuid: string;
        scope: ContactAudienceAnalysisScope;
        filter_uuid: string | null;
        contact_list_uuid: string | null;
        audience_name: string;
        stats: ContactAudienceStats;
        scopeLabel: 'filter' | 'list';
    }): Promise<ContactAudienceAnalysisRecord> {
        const previous = await this.findPreviousCompletedAnalysis(
            input.user_uuid,
            input.scope,
            input.filter_uuid,
            input.contact_list_uuid,
        );

        const previousForPrompt = previous
            ? {
                  created_at: previous.created_at.toISOString(),
                  stats_snapshot: previous.stats_snapshot as unknown as ContactAudienceStats,
                  analysis: previous.analysis as ContactAudienceAnalysisContent,
              }
            : null;

        const row = await this.prisma.contactAudienceAnalysis.create({
            data: {
                user_uuid: input.user_uuid,
                scope: input.scope,
                filter_uuid: input.filter_uuid,
                contact_list_uuid: input.contact_list_uuid,
                audience_name: input.audience_name,
                stats_snapshot: input.stats as unknown as Prisma.InputJsonValue,
                status: ContactAudienceAnalysisStatus.PENDING,
            },
            select: analysisSelect,
        });

        try {
            const { response, usage } = await this.aiService.generateObjectWithSchema({
                provider: AiProviders.openai,
                model: AiModels.openai.gpt4oMini,
                system: AUDIENCE_ANALYSIS_SYSTEM_PROMPT,
                prompt: buildAudienceAnalysisPrompt(
                    input.scopeLabel,
                    input.audience_name,
                    input.stats,
                    previousForPrompt,
                ),
                schema: CONTACT_AUDIENCE_ANALYSIS_SCHEMA,
                temperature: 0.4,
            });

            const updated = await this.prisma.contactAudienceAnalysis.update({
                where: { uuid: row.uuid },
                data: {
                    status: ContactAudienceAnalysisStatus.COMPLETED,
                    analysis: response as Prisma.InputJsonValue,
                    provider: AiProviders.openai,
                    model: AiModels.openai.gpt4oMini,
                    input_tokens: usage?.inputTokens ?? null,
                    output_tokens: usage?.outputTokens ?? null,
                    cost_usd: usage?.totalCost ?? null,
                },
                select: analysisSelect,
            });

            return this.toRecord(updated);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'AI analysis failed';
            const updated = await this.prisma.contactAudienceAnalysis.update({
                where: { uuid: row.uuid },
                data: {
                    status: ContactAudienceAnalysisStatus.FAILED,
                    error: message,
                },
                select: analysisSelect,
            });
            return this.toRecord(updated);
        }
    }

    private async listAnalyses(
        user_uuid: string,
        where: Prisma.ContactAudienceAnalysisWhereInput,
        query: ListContactAudienceAnalysesDto,
    ): Promise<PaginatedContactAudienceAnalyses> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.contactAudienceAnalysis.findMany({
                where: { ...where, user_uuid },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
                select: analysisSelect,
            }),
            this.prisma.contactAudienceAnalysis.count({
                where: { ...where, user_uuid },
            }),
        ]);

        return {
            items: items.map((row) => this.toRecord(row)),
            total,
            page,
            limit,
            total_pages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    private async findPreviousCompletedAnalysis(
        user_uuid: string,
        scope: ContactAudienceAnalysisScope,
        filter_uuid: string | null,
        contact_list_uuid: string | null,
    ): Promise<AnalysisRow | null> {
        return this.prisma.contactAudienceAnalysis.findFirst({
            where: {
                user_uuid,
                scope,
                status: ContactAudienceAnalysisStatus.COMPLETED,
                ...(filter_uuid ? { filter_uuid } : {}),
                ...(contact_list_uuid ? { contact_list_uuid } : {}),
            },
            orderBy: { created_at: 'desc' },
            select: analysisSelect,
        });
    }

    private async assertFilterOwnership(user_uuid: string, filterUuid: string): Promise<void> {
        const filter = await this.prisma.filter.findFirst({
            where: { uuid: filterUuid, user_uuid },
            select: { uuid: true },
        });
        if (!filter) throw new NotFoundException('Filter not found');
    }

    private async assertListOwnership(user_uuid: string, listUuid: string): Promise<void> {
        const list = await this.prisma.contactList.findFirst({
            where: { uuid: listUuid, user_uuid },
            select: { uuid: true },
        });
        if (!list) throw new NotFoundException('Contact list not found');
    }

    private toRecord(row: AnalysisRow): ContactAudienceAnalysisRecord {
        return {
            uuid: row.uuid,
            scope: row.scope,
            filter_uuid: row.filter_uuid,
            contact_list_uuid: row.contact_list_uuid,
            audience_name: row.audience_name,
            stats_snapshot: row.stats_snapshot as unknown as ContactAudienceStats,
            analysis: row.analysis as ContactAudienceAnalysisRecord['analysis'],
            status: row.status,
            error: row.error,
            provider: row.provider,
            model: row.model,
            input_tokens: row.input_tokens,
            output_tokens: row.output_tokens,
            cost_usd: row.cost_usd,
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString(),
        };
    }
}
