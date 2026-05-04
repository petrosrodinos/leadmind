import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRedisCacheDto } from './dto/create-redis-cache.dto';
import { CacheService } from '@/shared/services/cache/cache.service';

@Injectable()
export class RedisCacheService {

  constructor(
    private readonly cacheService: CacheService,
  ) { }

  async create(createRedisCacheDto: CreateRedisCacheDto) {

    try {

      await this.cacheService.set(createRedisCacheDto.key, createRedisCacheDto.value, 60 * 60);

    } catch (error) {
      throw new InternalServerErrorException('Failed to create redis cache');
    }

    return createRedisCacheDto;
  }


  async findOne(key: string) {

    try {

      const foundKey = await this.cacheService.get(key);

      if (!foundKey) {
        return "{}";
      }

      return foundKey;

    } catch (error) {
      throw new InternalServerErrorException('Failed to get redis cache');
    }
  }

  async remove(key: string) {
    try {
      await this.cacheService.delete(key);
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove redis cache');
    }
  }
}
