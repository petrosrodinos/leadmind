import { Module, Global, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from '../databases/redis/redis.constants';
import {
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
    OUTREACH_SEND_QUEUE,
    REMINDER_TRIGGER_QUEUE,
} from './queues.constants';
import { logBullMqPrefix, resolveBullMqPrefix } from './bullmq-prefix.util';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [REDIS_OPTIONS, ConfigService],
            useFactory: (redisOptions: RedisOptions | null, configService: ConfigService) => {
                const logger = new Logger('QueuesModule');
                if (!redisOptions) {
                    throw new Error('BULLMQ not initialized');
                }

                const prefix = resolveBullMqPrefix(configService);
                logBullMqPrefix(configService);
                logger.log(`BullMQ connected host=${redisOptions.host}:${redisOptions.port}`);

                return {
                    connection: redisOptions,
                    ...(prefix ? { prefix } : {}),
                };
            },
        }),
        BullModule.registerQueue({ name: OUTREACH_SEND_QUEUE }),
        BullModule.registerQueue({ name: MARKETING_CAMPAIGN_DISPATCH_QUEUE }),
        BullModule.registerQueue({ name: MARKETING_MESSAGE_SEND_QUEUE }),
        BullModule.registerQueue({ name: REMINDER_TRIGGER_QUEUE }),
    ],
    exports: [BullModule],
})
export class QueuesModule { }
