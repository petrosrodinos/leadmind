import { Module, Global } from '@nestjs/common';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import {
    AI_PROCESS_QUEUE,
    BULL_BOARD_ADAPTER,
    FILTER_SCRAPE_QUEUE,
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
    OUTREACH_SEND_QUEUE,
    REMINDER_TRIGGER_QUEUE,
} from './queues.constants';

@Global()
@Module({
    imports: [
        BullModule.registerQueue(
            { name: FILTER_SCRAPE_QUEUE },
            { name: AI_PROCESS_QUEUE },
            { name: OUTREACH_SEND_QUEUE },
            { name: MARKETING_CAMPAIGN_DISPATCH_QUEUE },
            { name: MARKETING_MESSAGE_SEND_QUEUE },
            { name: REMINDER_TRIGGER_QUEUE },
        ),
    ],
    providers: [
        {
            provide: BULL_BOARD_ADAPTER,
            inject: [
                getQueueToken(FILTER_SCRAPE_QUEUE),
                getQueueToken(AI_PROCESS_QUEUE),
                getQueueToken(OUTREACH_SEND_QUEUE),
                getQueueToken(MARKETING_CAMPAIGN_DISPATCH_QUEUE),
                getQueueToken(MARKETING_MESSAGE_SEND_QUEUE),
                getQueueToken(REMINDER_TRIGGER_QUEUE),
            ],
            useFactory: (
                filterScrapeQueue: Queue,
                aiProcessQueue: Queue,
                outreachSendQueue: Queue,
                marketingCampaignDispatchQueue: Queue,
                marketingMessageSendQueue: Queue,
                reminderTriggerQueue: Queue,
            ) => {
                const serverAdapter = new ExpressAdapter();
                serverAdapter.setBasePath('/admin/queues');

                createBullBoard({
                    queues: [
                        new BullMQAdapter(filterScrapeQueue),
                        new BullMQAdapter(aiProcessQueue),
                        new BullMQAdapter(outreachSendQueue),
                        new BullMQAdapter(marketingCampaignDispatchQueue),
                        new BullMQAdapter(marketingMessageSendQueue),
                        new BullMQAdapter(reminderTriggerQueue),
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
