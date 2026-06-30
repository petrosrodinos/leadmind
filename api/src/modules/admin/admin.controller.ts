import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRole } from '@/generated/prisma';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ListBatchJobsDto } from './dto/list-batch-jobs.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('system-status')
    @ApiOperation({ summary: 'Get API, database, and Redis health (admin only)' })
    getSystemStatus() {
        return this.adminService.getSystemStatus();
    }

    @Get('batch-jobs')
    @ApiOperation({ summary: 'List all OpenAI batch jobs (admin only)' })
    listBatchJobs(@Query() query: ListBatchJobsDto) {
        return this.adminService.listBatchJobs(query);
    }

    @Post('batch-jobs/:batchId/sync')
    @ApiOperation({ summary: 'Pull OpenAI batch results into the app (admin only)' })
    syncBatchJob(@Param('batchId') batchId: string) {
        return this.adminService.syncBatchJob(batchId);
    }
}
