import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_OPTIONS } from './redis.constants';
import type { RedisOptions } from 'ioredis';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_OPTIONS,
            useFactory: (configService: ConfigService): RedisOptions | null => {
                const logger = new Logger('RedisModule');

                const redisUrl = configService.get<string>('REDIS_URL');

                if (!redisUrl) {
                    logger.warn('REDIS not initialized');
                    return null;
                }

                const url = new URL(redisUrl);
                return {
                    host: url.hostname,
                    port: parseInt(url.port, 10) || 6379,
                    password: url.password || undefined,
                    username: url.username || undefined,
                    maxRetriesPerRequest: null,
                    reconnectOnError: () => false,
                };
            },
            inject: [ConfigService],
        },
    ],
    exports: [REDIS_OPTIONS],
})
export class RedisModule { }
