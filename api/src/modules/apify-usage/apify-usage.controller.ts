import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ApifyUsageService } from './apify-usage.service';
import { ApifyUsageSummaryDto, ListApifyUsageDto } from './dto/list-apify-usage.dto';

@ApiTags('apify-usage')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('apify-usage')
export class ApifyUsageController {
    constructor(private readonly apifyUsageService: ApifyUsageService) {}

    @Get()
    @ApiOperation({ summary: 'List Apify usage logs for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListApifyUsageDto) {
        return this.apifyUsageService.findAll(user_uuid, query);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get Apify usage summary for the current user' })
    getSummary(@CurrentUser('uuid') user_uuid: string, @Query() query: ApifyUsageSummaryDto) {
        return this.apifyUsageService.getSummary(user_uuid, query);
    }
}
