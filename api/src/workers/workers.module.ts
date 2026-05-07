import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { LeadsModule } from '@/modules/leads/leads.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { AI_PROCESS_QUEUE, FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { FilterScrapeWorker } from './filter-scrape.worker';
import { AiProcessWorker } from './ai-process.worker';

@Module({
    imports: [
        PrismaModule,
        ApifyModule,
        LeadsModule,
        ContactsModule,
        BullModule.registerQueue(
            { name: FILTER_SCRAPE_QUEUE },
            { name: AI_PROCESS_QUEUE },
        ),
    ],
    providers: [FilterScrapeWorker, AiProcessWorker],
    exports: [FilterScrapeWorker, AiProcessWorker],
})
export class WorkersModule { }
