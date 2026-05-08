import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { DashboardService } from './dashboard.service';
import { DashboardListQueryDto } from './dto/dashboard-query.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({
        summary:
            'Aggregated dashboard counters: totals, conversion rate, status breakdown, etc.',
    })
    getStats(@CurrentUser('uuid') user_uuid: string) {
        return this.dashboardService.getStats(user_uuid);
    }

    @Get('top-contacts')
    @ApiOperation({ summary: 'Top scored contacts for the dashboard widget' })
    getTopContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Query() query: DashboardListQueryDto,
    ) {
        return this.dashboardService.getTopContacts(user_uuid, query.limit ?? 5);
    }

    @Get('pending-drafts')
    @ApiOperation({
        summary: 'Contacts that have at least one PENDING outreach message',
    })
    getPendingDrafts(
        @CurrentUser('uuid') user_uuid: string,
        @Query() query: DashboardListQueryDto,
    ) {
        return this.dashboardService.getPendingDrafts(user_uuid, query.limit ?? 5);
    }
}
