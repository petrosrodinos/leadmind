import { Injectable } from '@nestjs/common';
import { EnrichmentSource, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ListEnrichmentsDto } from '../dto/list-enrichments.dto';
import { EnrichmentTarget, EnrichmentTargetKind } from '../interfaces/enrichment-target.interface';

@Injectable()
export class EnrichmentQueryService {
    constructor(private readonly prisma: PrismaService) {}

    async findForTarget(kind: EnrichmentTargetKind, entityUuid: string, query: ListEnrichmentsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        if (kind === 'lead') {
            return this.findLeadEnrichments(entityUuid, { page, limit, skip, search, source: query.source });
        }

        return this.findContactEnrichments(entityUuid, { page, limit, skip, search, source: query.source });
    }

    private async findLeadEnrichments(
        leadUuid: string,
        opts: {
            page: number;
            limit: number;
            skip: number;
            search?: string;
            source?: EnrichmentSource;
        },
    ) {
        const where: Prisma.LeadEnrichmentWhereInput = {
            lead_uuid: leadUuid,
            ...(opts.source && { source: opts.source }),
            ...(opts.search
                ? {
                      OR: [
                          { summary: { contains: opts.search, mode: 'insensitive' } },
                          { source_url: { contains: opts.search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.leadEnrichment.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: opts.skip,
                take: opts.limit,
            }),
            this.prisma.leadEnrichment.count({ where }),
        ]);

        return this.paginatedResponse(rows, total, opts.page, opts.limit, 'lead', leadUuid);
    }

    private async findContactEnrichments(
        contactUuid: string,
        opts: {
            page: number;
            limit: number;
            skip: number;
            search?: string;
            source?: EnrichmentSource;
        },
    ) {
        const where: Prisma.ContactEnrichmentWhereInput = {
            contact_uuid: contactUuid,
            ...(opts.source && { source: opts.source }),
            ...(opts.search
                ? {
                      OR: [
                          { summary: { contains: opts.search, mode: 'insensitive' } },
                          { source_url: { contains: opts.search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.contactEnrichment.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip: opts.skip,
                take: opts.limit,
            }),
            this.prisma.contactEnrichment.count({ where }),
        ]);

        return this.paginatedResponse(rows, total, opts.page, opts.limit, 'contact', contactUuid);
    }

    private paginatedResponse(
        rows: Array<{
            uuid: string;
            source: EnrichmentSource;
            source_url: string | null;
            summary: string | null;
            payload: Prisma.JsonValue | null;
            cost_usd: Prisma.Decimal | null;
            input_tokens: number | null;
            output_tokens: number | null;
            metadata: Prisma.JsonValue | null;
            created_at: Date;
        }>,
        total: number,
        page: number,
        limit: number,
        kind: EnrichmentTargetKind,
        entityUuid: string,
    ) {
        const data = rows.map((r) => ({
            uuid: r.uuid,
            entity_kind: kind,
            entity_uuid: entityUuid,
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

    targetLabel(target: EnrichmentTarget): string {
        return `${target.kind}:${target.uuid}`;
    }
}
