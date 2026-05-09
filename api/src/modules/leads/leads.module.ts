import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadAiService } from './utils/lead-ai.service';
import { LeadEnrichmentOrchestrator } from './services/lead-enrichment.orchestrator';

@Module({
    imports: [
        PrismaModule,
        AiIntegrationModule,
        ApifyModule,
        BullModule.registerQueue({ name: AI_PROCESS_QUEUE }),
    ],
    controllers: [LeadsController],
    providers: [LeadsService, LeadAiService, LeadEnrichmentOrchestrator],
    exports: [LeadsService, LeadAiService, LeadEnrichmentOrchestrator],
})
export class LeadsModule { }
