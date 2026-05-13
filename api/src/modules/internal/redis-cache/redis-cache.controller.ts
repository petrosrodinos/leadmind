import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RedisCacheService } from './redis-cache.service';
import { CreateRedisCacheDto } from './dto/create-redis-cache.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
@Controller('redis-cache')
export class RedisCacheController {
  constructor(private readonly redisCacheService: RedisCacheService) { }

  @Post()
  @ApiOperation({ summary: 'Set a cache entry (admin only)', description: 'Stores a key-value pair in Redis with an optional TTL.' })
  @ApiBody({ type: CreateRedisCacheDto })
  @ApiResponse({ status: 201, description: 'Cache entry created' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  create(@Body() createRedisCacheDto: CreateRedisCacheDto) {
    return this.redisCacheService.create(createRedisCacheDto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a cache entry by key (admin only)' })
  @ApiParam({ name: 'key', type: String, description: 'The Redis cache key to retrieve' })
  @ApiResponse({ status: 200, description: 'Cache value returned' })
  @ApiResponse({ status: 404, description: 'Key not found in cache' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  findOne(@Param('key') key: string) {
    return this.redisCacheService.findOne(key);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a cache entry by key (admin only)' })
  @ApiParam({ name: 'key', type: String, description: 'The Redis cache key to delete' })
  @ApiResponse({ status: 200, description: 'Cache entry deleted' })
  @ApiResponse({ status: 404, description: 'Key not found in cache' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  remove(@Param('key') key: string) {
    return this.redisCacheService.remove(key);
  }
}
