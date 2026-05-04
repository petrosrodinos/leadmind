import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { RedisCacheController } from './redis-cache.controller';
import { AppCacheModule } from '@/shared/services/cache/cache.module';

@Module({
  imports: [AppCacheModule],
  controllers: [RedisCacheController],
  providers: [RedisCacheService],
})
export class RedisCacheModule { }
