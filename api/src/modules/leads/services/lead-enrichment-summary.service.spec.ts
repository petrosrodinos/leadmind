import { EnrichmentSource, SourceType } from '@/generated/prisma';
import { LEAD_ENRICHMENT_SUMMARY_MODEL } from '@/integrations/ai/constants/lead-enrichment-ai.constants';
import { LeadEnrichmentSummaryService } from './lead-enrichment-summary.service';

describe('LeadEnrichmentSummaryService', () => {
    const lead = {
        uuid: 'lead-1',
        name: 'Ada Lovelace',
        title: null,
        company: 'Analytical Engines',
        email: null,
        phone: null,
        linkedin_url: 'https://www.linkedin.com/in/ada',
        website: null,
        location: null,
        industry: null,
        id: 1,
        raw_lead_uuid: null,
        description: null,
        source_type: SourceType.LINKEDIN,
        raw_data: null,
        enrichment_summary: null,
        enrichment_metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
    };

    function createService(options?: { openaiConfigured?: boolean; aiFails?: boolean }) {
        const prisma = {
            lead: {
                findUnique: jest.fn().mockResolvedValue(lead),
                update: jest.fn().mockResolvedValue({ ...lead, enrichment_summary: 'updated' }),
            },
            leadEnrichment: {
                findMany: jest.fn(),
            },
        };
        const aiService = {
            generateObjectWithSchema: jest.fn().mockImplementation(async () => {
                if (options?.aiFails) {
                    throw new Error('openai down');
                }
                return {
                    response: {
                        summary: 'AI summary',
                        metadata: { services: ['Consulting'], years_in_business: 12 },
                    },
                    usage: { totalCost: 0 },
                };
            }),
        };
        const aiConfig = {
            isOpenAiConfigured: jest.fn().mockReturnValue(options?.openaiConfigured ?? true),
        };

        return {
            service: new LeadEnrichmentSummaryService(prisma as any, aiService as any, aiConfig as any),
            prisma,
            aiService,
            aiConfig,
        };
    }

    it('calls OpenAI with only the latest row per source', async () => {
        const { service, prisma, aiService } = createService();
        prisma.leadEnrichment.findMany.mockResolvedValue([
            {
                uuid: 'new',
                lead_uuid: lead.uuid,
                source: EnrichmentSource.LINKEDIN,
                source_url: 'new-url',
                summary: 'new linkedin',
                payload: { data: { name: 'Ada' } },
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
                metadata: null,
                created_at: new Date('2026-01-02'),
                id: 2,
            },
            {
                uuid: 'old',
                lead_uuid: lead.uuid,
                source: EnrichmentSource.LINKEDIN,
                source_url: 'old-url',
                summary: 'old linkedin',
                payload: { data: { name: 'Old' } },
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
                metadata: null,
                created_at: new Date('2026-01-01'),
                id: 1,
            },
        ]);

        await service.regenerate(lead.uuid);

        expect(aiService.generateObjectWithSchema).toHaveBeenCalledTimes(1);
        expect(aiService.generateObjectWithSchema.mock.calls[0][0].model).toBe(LEAD_ENRICHMENT_SUMMARY_MODEL);
        const prompt = aiService.generateObjectWithSchema.mock.calls[0][0].prompt as string;
        expect(prompt).toContain('Source type: LINKEDIN');
        expect(prompt).toContain('new linkedin');
        expect(prompt).not.toContain('old linkedin');
        expect(prisma.lead.update).toHaveBeenCalledWith({
            where: { uuid: lead.uuid },
            data: {
                enrichment_summary: 'AI summary',
                enrichment_metadata: { services: ['Consulting'], years_in_business: 12 },
            },
        });
    });

    it('falls back to deterministic summary when OpenAI is unavailable', async () => {
        const { service, prisma, aiService } = createService({ openaiConfigured: false });
        prisma.leadEnrichment.findMany.mockResolvedValue([
            {
                uuid: 'web',
                lead_uuid: lead.uuid,
                source: EnrichmentSource.WEBSITE,
                source_url: 'https://example.com',
                summary: 'website summary',
                payload: { text_sample: 'website text' },
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
                metadata: null,
                created_at: new Date(),
                id: 1,
            },
        ]);

        const result = await service.regenerate(lead.uuid);

        expect(aiService.generateObjectWithSchema).not.toHaveBeenCalled();
        expect(result).toBe('website summary');
        expect(prisma.lead.update).toHaveBeenCalledWith({
            where: { uuid: lead.uuid },
            data: { enrichment_summary: 'website summary', enrichment_metadata: null },
        });
    });

    it('falls back to deterministic summary when OpenAI fails', async () => {
        const { service, prisma } = createService({ aiFails: true });
        prisma.leadEnrichment.findMany.mockResolvedValue([
            {
                uuid: 'google',
                lead_uuid: lead.uuid,
                source: EnrichmentSource.GOOGLE_SEARCH,
                source_url: 'Ada Analytical Engines',
                summary: 'google summary',
                payload: { results: [{ title: 'Google result' }] },
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
                metadata: null,
                created_at: new Date(),
                id: 1,
            },
        ]);

        const result = await service.regenerate(lead.uuid);

        expect(result).toBe('google summary');
        expect(prisma.lead.update).toHaveBeenCalledWith({
            where: { uuid: lead.uuid },
            data: { enrichment_summary: 'google summary', enrichment_metadata: null },
        });
    });
});
