import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import type { RedisOptions } from 'ioredis';
import { REDIS_OPTIONS } from '../databases/redis/redis.constants';

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
    ],
    exports: [BullModule],
})
export class QueuesModule { }
