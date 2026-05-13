import { Injectable, Logger } from '@nestjs/common';
import { Lead, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiConfig } from '@/integrations/ai/utils/ai.config';
import { LEAD_ENRICHMENT_SUMMARY_MODEL } from '@/integrations/ai/constants/lead-enrichment-ai.constants';
import { AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import {
    buildLeadEnrichmentSummaryPrompt,
    leadEnrichmentSummaryAiResponseSchema,
    LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
} from '../constants/ai-config';
import {
    buildDeterministicLeadEnrichmentSummary,
    coerceLeadEnrichmentMetadata,
    formatLeadEnrichmentRowsForSummary,
} from '../utils/lead-enrichment-summary.utils';

@Injectable()
export class LeadEnrichmentSummaryService {
    private readonly logger = new Logger(LeadEnrichmentSummaryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly aiConfig: AiConfig,
    ) {}

    async regenerate(leadUuid: string): Promise<string | null> {
        const lead = await this.prisma.lead.findUnique({ where: { uuid: leadUuid } });
        if (!lead) {
            this.logger.warn(`Lead ${leadUuid} not found while regenerating enrichment summary`);
            return null;
        }

        const rows = await this.prisma.leadEnrichment.findMany({
            where: { lead_uuid: leadUuid },
            orderBy: { created_at: 'desc' },
        });
        const fallback = buildDeterministicLeadEnrichmentSummary(rows);

        if (!rows.length) {
            await this.updateLeadSummary(leadUuid, null, null);
            return null;
        }

        if (!this.aiConfig.isOpenAiConfigured()) {
            await this.updateLeadSummary(leadUuid, fallback, null);
            return fallback;
        }

        try {
            const sourceContext = formatLeadEnrichmentRowsForSummary(rows);
            const model = LEAD_ENRICHMENT_SUMMARY_MODEL;
            const prompt = buildLeadEnrichmentSummaryPrompt(lead as Lead, sourceContext);
            const { response } = await this.aiService.generateObjectWithSchema({
                provider: AiProviders.openai,
                model,
                prompt,
                system: LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
                schema: leadEnrichmentSummaryAiResponseSchema,
                maxTokens: 1_536,
            });
            const summary = response.summary?.trim() || fallback;
            const metadata = coerceLeadEnrichmentMetadata(response.metadata);
            await this.updateLeadSummary(leadUuid, summary, metadata);
            return summary;
        } catch (error) {
            this.logger.warn(
                `Lead ${leadUuid} OpenAI summary generation failed: ${error instanceof Error ? error.message : error}`,
            );
            await this.updateLeadSummary(leadUuid, fallback, null);
            return fallback;
        }
    }

    private async updateLeadSummary(
        leadUuid: string,
        summary: string | null,
        metadata: Prisma.InputJsonValue | null,
    ): Promise<void> {
        await this.prisma.lead.update({
            where: { uuid: leadUuid },
            data: { enrichment_summary: summary, enrichment_metadata: metadata },
        });
    }
}
