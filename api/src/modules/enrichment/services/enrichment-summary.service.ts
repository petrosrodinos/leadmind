import { Injectable, Logger } from '@nestjs/common';
import { Lead, Prisma, EnrichmentSource } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiConfig } from '@/integrations/ai/utils/ai.config';
import { LEAD_ENRICHMENT_SUMMARY_MODEL } from '@/integrations/ai/constants/lead-enrichment-ai.constants';
import { AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import {
    buildLeadEnrichmentSummaryPrompt,
    leadEnrichmentSummaryAiResponseSchema,
    LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
} from '@/modules/leads/constants/ai-config';
import { EnrichmentTarget } from '../interfaces/enrichment-target.interface';
import {
    buildDeterministicEnrichmentSummary,
    coerceEnrichmentMetadata,
    formatEnrichmentRowsForSummary,
} from '../utils/enrichment-summary.utils';
import { subjectAsLeadLike } from '../utils/enrichment-subject.utils';

@Injectable()
export class EnrichmentSummaryService {
    private readonly logger = new Logger(EnrichmentSummaryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly aiConfig: AiConfig,
    ) {}

    async regenerate(target: EnrichmentTarget): Promise<string | null> {
        if (target.kind === 'lead') {
            return this.regenerateLead(target.uuid);
        }
        return this.regenerateContact(target.uuid);
    }

    async regenerateLead(leadUuid: string): Promise<string | null> {
        const lead = await this.prisma.lead.findUnique({ where: { uuid: leadUuid } });
        if (!lead) {
            this.logger.warn(`Lead ${leadUuid} not found while regenerating enrichment summary`);
            return null;
        }

        const contact = await this.prisma.contact.findFirst({
            where: { lead_uuid: leadUuid },
            select: { user_uuid: true },
        });
        const user_uuid = contact?.user_uuid ?? null;

        const rows = await this.prisma.leadEnrichment.findMany({
            where: { lead_uuid: leadUuid },
            orderBy: { created_at: 'desc' },
        });
        return this.regenerateFromRows(
            lead,
            rows,
            user_uuid,
            async (summary, metadata) => {
                await this.prisma.lead.update({
                    where: { uuid: leadUuid },
                    data: { enrichment_summary: summary, enrichment_metadata: metadata },
                });
            },
            leadUuid,
        );
    }

    async regenerateContact(contactUuid: string): Promise<string | null> {
        const contact = await this.prisma.contact.findUnique({
            where: { uuid: contactUuid },
            include: { lead: true },
        });
        if (!contact) {
            this.logger.warn(`Contact ${contactUuid} not found while regenerating enrichment summary`);
            return null;
        }

        const rows = await this.prisma.contactEnrichment.findMany({
            where: { contact_uuid: contactUuid },
            orderBy: { created_at: 'desc' },
        });
        const leadLike = subjectAsLeadLike({
            uuid: contact.uuid,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            website: contact.website,
            google_maps_url: contact.google_maps_url,
            linkedin_url: contact.linkedin_url,
            title: contact.title,
            location: contact.location,
            industry: contact.industry,
            description: contact.description,
            source_type: contact.lead.source_type,
            raw_data: contact.lead.raw_data,
        });
        return this.regenerateFromRows(
            leadLike,
            rows,
            contact.user_uuid,
            async (summary, metadata) => {
                await this.prisma.contact.update({
                    where: { uuid: contactUuid },
                    data: { enrichment_summary: summary, enrichment_metadata: metadata },
                });
            },
            contactUuid,
        );
    }

    private async regenerateFromRows(
        leadLike: Lead,
        rows: Array<{
            source: EnrichmentSource;
            summary: string | null;
            source_url: string | null;
            payload: Prisma.JsonValue | null;
            metadata: Prisma.JsonValue | null;
            created_at: Date;
        }>,
        user_uuid: string | null,
        persist: (summary: string | null, metadata: Prisma.InputJsonValue | null) => Promise<void>,
        entityLabel: string,
    ): Promise<string | null> {
        const fallback = buildDeterministicEnrichmentSummary(rows);

        if (!rows.length) {
            await persist(null, null);
            return null;
        }

        if (!user_uuid || !(await this.aiConfig.isOpenAiConfigured(user_uuid))) {
            await persist(fallback, null);
            return fallback;
        }

        try {
            const sourceContext = formatEnrichmentRowsForSummary(rows);
            const model = LEAD_ENRICHMENT_SUMMARY_MODEL;
            const prompt = buildLeadEnrichmentSummaryPrompt(leadLike, sourceContext);
            const { response } = await this.aiService.generateObjectWithSchema({
                user_uuid,
                provider: AiProviders.openai,
                model,
                prompt,
                system: LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
                schema: leadEnrichmentSummaryAiResponseSchema,
                maxTokens: 1_536,
                usage: {
                    operation: 'ENRICHMENT_SUMMARY',
                    reference_type: 'lead',
                    reference_uuid: leadLike.uuid,
                },
            });
            const summary = response.summary?.trim() || fallback;
            const metadata = coerceEnrichmentMetadata(response.metadata);
            await persist(summary, metadata);
            return summary;
        } catch (error) {
            this.logger.warn(
                `${entityLabel} OpenAI summary generation failed: ${error instanceof Error ? error.message : error}`,
            );
            await persist(fallback, null);
            return fallback;
        }
    }
}
