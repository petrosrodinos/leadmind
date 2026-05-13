import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InternalAiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: InternalAiService) { }

  @Post()
  @ApiOperation({ summary: 'Trigger an AI operation (admin only)', description: 'Internal endpoint restricted to admins. Executes an AI task defined by the request body.' })
  @ApiResponse({ status: 201, description: 'AI operation triggered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  create(@Body() createAiDto: CreateAiDto) {
    return this.aiService.create(createAiDto);
  }
}
