import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export function resolveBullMqPrefix(configService: ConfigService): string | undefined {
    const explicit = configService.get<string>('BULLMQ_PREFIX')?.trim();
    if (explicit) {
        return explicit;
    }
    return undefined;
}

export function logBullMqPrefix(configService: ConfigService): void {
    const logger = new Logger('QueuesModule');
    const prefix = resolveBullMqPrefix(configService);
    if (prefix) {
        logger.log(`BullMQ queue prefix="${prefix}"`);
        return;
    }
    logger.warn(
        'BullMQ queue prefix not set (BULLMQ_PREFIX). Local and deployed workers may consume the same jobs if they share REDIS_URL.',
    );
}
