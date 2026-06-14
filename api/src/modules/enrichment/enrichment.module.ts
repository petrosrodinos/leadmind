import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { GemiModule } from '@/integrations/gemi/gemi.module';
import { LeadsModule } from '@/modules/leads/leads.module';
import { EnrichmentOrchestrator } from './services/enrichment.orchestrator';
import { EnrichmentQueryService } from './services/enrichment-query.service';
import { EnrichmentSummaryService } from './services/enrichment-summary.service';

@Module({
    imports: [
        PrismaModule,
        AiIntegrationModule,
        ApifyModule,
        GemiModule,
        forwardRef(() => LeadsModule),
    ],
    providers: [EnrichmentOrchestrator, EnrichmentQueryService, EnrichmentSummaryService],
    exports: [EnrichmentOrchestrator, EnrichmentQueryService, EnrichmentSummaryService],
})
export class EnrichmentModule {}
