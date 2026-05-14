import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ScoringInstructionsModule } from '@/modules/scoring-instructions/scoring-instructions.module';
import { FILTER_SCRAPE_QUEUE } from '@/core/queues/queues.constants';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';

@Module({
    imports: [
        PrismaModule,
        ScoringInstructionsModule,
        BullModule.registerQueue({ name: FILTER_SCRAPE_QUEUE }),
    ],
    controllers: [FiltersController],
    providers: [FiltersService],
    exports: [FiltersService],
})
export class FiltersModule { }
