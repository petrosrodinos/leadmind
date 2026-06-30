import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ScoringInstructionsModule } from '@/modules/scoring-instructions/scoring-instructions.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { ContactAudienceStatsModule } from '@/modules/contact-audience-stats/contact-audience-stats.module';

@Module({
    imports: [
        PrismaModule,
        ScoringInstructionsModule,
        ContactAudienceStatsModule,
        ApifyModule,
        BullModule.registerQueue({ name: FILTER_SCRAPE_QUEUE }),
    ],
    controllers: [FiltersController],
    providers: [FiltersService],
    exports: [FiltersService],
})
export class FiltersModule { }
