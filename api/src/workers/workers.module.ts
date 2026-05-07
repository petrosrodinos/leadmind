import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { AI_PROCESS_QUEUE, FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { FilterScrapeWorker } from './filter-scrape.worker';

@Module({
    imports: [
        PrismaModule,
        ApifyModule,
        BullModule.registerQueue(
            { name: FILTER_SCRAPE_QUEUE },
            { name: AI_PROCESS_QUEUE },
        ),
    ],
    providers: [FilterScrapeWorker],
    exports: [FilterScrapeWorker],
})
export class WorkersModule { }
