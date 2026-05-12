import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import type { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from '../databases/redis/redis.constants';
import {
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
    OUTREACH_SEND_QUEUE,
} from './queues.constants';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [REDIS_OPTIONS],
            useFactory: (redisOptions: RedisOptions | null) => {
                if (!redisOptions) {
                    throw new Error('BULLMQ not initialized');
                }

                return {
                    connection: redisOptions,
                };
            },
        }),
        BullModule.registerQueue({ name: OUTREACH_SEND_QUEUE }),
        BullModule.registerQueue({ name: MARKETING_CAMPAIGN_DISPATCH_QUEUE }),
        BullModule.registerQueue({ name: MARKETING_MESSAGE_SEND_QUEUE }),
    ],
    exports: [BullModule],
})
export class QueuesModule { }
