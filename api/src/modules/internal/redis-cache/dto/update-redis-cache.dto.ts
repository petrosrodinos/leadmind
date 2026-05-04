import { PartialType } from '@nestjs/mapped-types';
import { CreateRedisCacheDto } from './create-redis-cache.dto';

export class UpdateRedisCacheDto extends PartialType(CreateRedisCacheDto) {}
