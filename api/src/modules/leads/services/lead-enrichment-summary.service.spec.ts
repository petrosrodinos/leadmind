import { EnrichmentSummaryService } from '@/modules/enrichment/services/enrichment-summary.service';
import { LeadEnrichmentSummaryService } from './lead-enrichment-summary.service';

describe('LeadEnrichmentSummaryService', () => {
    it('delegates regenerate to EnrichmentSummaryService', async () => {
        const summaryService = {
            regenerateLead: jest.fn().mockResolvedValue('updated summary'),
        };
        const service = new LeadEnrichmentSummaryService(
            summaryService as unknown as EnrichmentSummaryService,
        );

        const result = await service.regenerate('lead-1');

        expect(summaryService.regenerateLead).toHaveBeenCalledWith('lead-1');
        expect(result).toBe('updated summary');
    });
});
