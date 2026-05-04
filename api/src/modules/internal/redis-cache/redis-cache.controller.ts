import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CreateRedisCacheDto } from './dto/create-redis-cache.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@Controller('redis-cache')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
export class RedisCacheController {
  constructor(private readonly redisCacheService: RedisCacheService) { }

  @Post()
  create(@Body() createRedisCacheDto: CreateRedisCacheDto) {
    return this.redisCacheService.create(createRedisCacheDto);
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.redisCacheService.findOne(key);
  }


  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.redisCacheService.remove(key);
  }
}
