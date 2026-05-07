import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({ name: FILTER_SCRAPE_QUEUE }),
    ],
    controllers: [FiltersController],
    providers: [FiltersService],
    exports: [FiltersService],
})
export class FiltersModule { }
