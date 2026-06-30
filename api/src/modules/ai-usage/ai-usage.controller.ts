import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AiUsageService } from './ai-usage.service';
import { AiUsageSummaryDto, ListAiUsageDto } from './dto/list-ai-usage.dto';

@ApiTags('ai-usage')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('ai-usage')
export class AiUsageController {
    constructor(private readonly aiUsageService: AiUsageService) {}

    @Get()
    @ApiOperation({ summary: 'List AI usage logs for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListAiUsageDto) {
        return this.aiUsageService.findAll(user_uuid, query);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get AI usage summary for the current user' })
    getSummary(@CurrentUser('uuid') user_uuid: string, @Query() query: AiUsageSummaryDto) {
        return this.aiUsageService.getSummary(user_uuid, query);
    }
}
