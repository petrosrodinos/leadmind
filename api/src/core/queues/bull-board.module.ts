import { Module, Global } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { AI_PROCESS_QUEUE, BULL_BOARD_ADAPTER, FILTER_SCRAPE_QUEUE } from './queues.constants';


@Global()
@Module({
    imports: [
        BullModule.registerQueue(
            { name: FILTER_SCRAPE_QUEUE },
            { name: AI_PROCESS_QUEUE },
        ),
    ],
    providers: [
        {
            provide: BULL_BOARD_ADAPTER,
            inject: [
                getQueueToken(FILTER_SCRAPE_QUEUE),
                getQueueToken(AI_PROCESS_QUEUE),
            ],
            useFactory: (filterScrapeQueue: Queue, aiProcessQueue: Queue) => {
                const serverAdapter = new ExpressAdapter();
                serverAdapter.setBasePath('/admin/queues');

                createBullBoard({
                    queues: [
                        new BullMQAdapter(filterScrapeQueue),
                        new BullMQAdapter(aiProcessQueue),
                    ],
                    serverAdapter,
                });

                return serverAdapter;
            },
        },
    ],
    exports: [BULL_BOARD_ADAPTER, BullModule],
})
export class BullBoardModule { }
