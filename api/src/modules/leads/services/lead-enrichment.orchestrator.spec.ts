import { EnrichmentSource, SourceType } from '@/generated/prisma';
import { LeadEnrichmentOrchestrator } from './lead-enrichment.orchestrator';

describe('LeadEnrichmentOrchestrator', () => {
    const lead = {
        id: 1,
        uuid: 'lead-1',
        raw_lead_uuid: null,
        name: 'Grace Hopper',
        email: null,
        phone: null,
        company: 'Navy',
        website: null,
        linkedin_url: null,
        title: null,
        location: null,
        industry: null,
        description: null,
        source_type: SourceType.LINKEDIN,
        raw_data: null,
        enrichment_summary: null,
        enrichment_metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
    };

    function createOrchestrator() {
        const tx = {
            leadEnrichment: {
                create: jest.fn().mockResolvedValue({}),
            },
            lead: {
                update: jest.fn().mockResolvedValue({}),
            },
        };
        const prisma = {
            lead: {
                findUnique: jest.fn().mockResolvedValue(lead),
            },
            leadEnrichment: {
                findFirst: jest.fn().mockResolvedValue(null),
            },
            $transaction: jest.fn(async (callback: any) => callback(tx)),
        };
        const googleSearch = {
            fetchRawItems: jest.fn().mockResolvedValue([
                {
                    organicResults: [
                        {
                            title: 'Grace Hopper biography',
                            url: 'https://example.com/grace',
                            description: 'Computer scientist and Navy officer',
                        },
                    ],
                    paidResults: [],
                },
            ]),
        };
        const summaryService = {
            regenerate: jest.fn().mockResolvedValue('summary'),
        };
        const leadAi = {
            buildAiEnrichmentResult: jest.fn(),
            summarizeLinkedInEnrichment: jest.fn().mockResolvedValue({
                summary: 'LinkedIn summary',
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            }),
            summarizeWebsiteEnrichment: jest.fn().mockResolvedValue({
                summary: 'Website summary',
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            }),
            summarizeGoogleSearchEnrichment: jest.fn().mockResolvedValue({
                summary: 'Google summary',
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            }),
        };
        const orchestrator = new LeadEnrichmentOrchestrator(
            prisma as any,
            leadAi as any,
            { fetchCompany: jest.fn() } as any,
            { fetchProfile: jest.fn() } as any,
            { crawlSinglePage: jest.fn() } as any,
            googleSearch as any,
            { getCompanyDocuments: jest.fn().mockResolvedValue(null) } as any,
            summaryService as any,
        );

        return { orchestrator, prisma, tx, googleSearch, summaryService, leadAi };
    }

    it('stores a failed attempt and continues with the next requested source', async () => {
        const { orchestrator, tx, googleSearch, summaryService } = createOrchestrator();

        await orchestrator.run(lead.uuid, [EnrichmentSource.WEBSITE, EnrichmentSource.GOOGLE_SEARCH], {
            force: true,
        });

        expect(tx.leadEnrichment.create).toHaveBeenCalledTimes(2);
        expect(tx.leadEnrichment.create.mock.calls[0][0].data.source).toBe(EnrichmentSource.WEBSITE);
        expect(tx.leadEnrichment.create.mock.calls[0][0].data.metadata.status).toBe('failed');
        expect(tx.leadEnrichment.create.mock.calls[1][0].data.source).toBe(EnrichmentSource.GOOGLE_SEARCH);
        expect(tx.leadEnrichment.create.mock.calls[1][0].data.metadata.status).toBe('success');
        expect(googleSearch.fetchRawItems).toHaveBeenCalledTimes(1);
        expect(summaryService.regenerate).toHaveBeenCalledTimes(2);
    });
});
