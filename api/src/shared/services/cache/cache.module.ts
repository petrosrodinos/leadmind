import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import * as memoryStore from 'cache-manager-memory-store';

@Module({
    imports: [
        CacheModule.register({
            store: memoryStore,
            max: 500,
            ttl: 1000 * 60 * 2,
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class AppCacheModule { }
