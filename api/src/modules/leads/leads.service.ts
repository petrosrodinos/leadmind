import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EnrichmentSource, Prisma, Lead } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { EnrichLeadDto } from './dto/enrich-lead.dto';
import { ListLeadEnrichmentsDto } from './dto/list-lead-enrichments.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { resolveLeadEnrichmentSources } from './utils/enrichment-sources.utils';

@Injectable()
export class LeadsService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue(AI_PROCESS_QUEUE) private readonly aiProcessQueue: Queue,
        private readonly elasticsearchService: ElasticsearchService,
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

    async update(uuid: string, dto: UpdateLeadDto): Promise<Lead> {
        await this.findOne(uuid);
        return this.prisma.lead.update({
            where: { uuid },
            data: dto,
        });
    }

    async remove(uuid: string): Promise<{ uuid: string }> {
        await this.findOne(uuid);
        const contacts = await this.prisma.contact.findMany({
            where: { lead_uuid: uuid },
            select: { uuid: true },
        });
        await this.prisma.lead.delete({ where: { uuid } });
        await this.elasticsearchService.deleteLead(uuid);
        await Promise.all(contacts.map((c) => this.elasticsearchService.deleteContact(c.uuid)));
        return { uuid };
    }

    async findEnrichmentsForLead(leadUuid: string, query: ListLeadEnrichmentsDto) {
        await this.findOne(leadUuid);
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        const where: Prisma.LeadEnrichmentWhereInput = {
            lead_uuid: leadUuid,
            ...(query.source && { source: query.source }),
            ...(search
                ? {
                      OR: [
                          { summary: { contains: search, mode: 'insensitive' } },
                          { source_url: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.leadEnrichment.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.leadEnrichment.count({ where }),
        ]);

        const data = rows.map((r) => ({
            uuid: r.uuid,
            lead_uuid: r.lead_uuid,
            source: r.source,
            source_url: r.source_url,
            summary: r.summary,
            payload: r.payload,
            cost_usd: r.cost_usd != null ? Number(r.cost_usd) : null,
            input_tokens: r.input_tokens,
            output_tokens: r.output_tokens,
            metadata: r.metadata,
            created_at: r.created_at,
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async triggerEnrich(uuid: string, dto: EnrichLeadDto): Promise<{ jobId: string }> {
        await this.findOne(uuid);
        const enrichment_sources: EnrichmentSource[] = resolveLeadEnrichmentSources(dto.sources);
        const job = await this.aiProcessQueue.add(
            `lead-enrich:${uuid}`,
            {
                lead_uuid: uuid,
                enrichment_sources,
                force_enrichment: true,
            },
            { removeOnComplete: 100, removeOnFail: 100 },
        );

        return { jobId: String(job.id) };
    }
}
