import { Injectable } from '@nestjs/common';
import { EnrichmentSummaryService } from '@/modules/enrichment/services/enrichment-summary.service';

@Injectable()
export class LeadEnrichmentSummaryService {
    constructor(private readonly summaryService: EnrichmentSummaryService) {}

    async regenerate(leadUuid: string): Promise<string | null> {
        return this.summaryService.regenerateLead(leadUuid);
    }
}
