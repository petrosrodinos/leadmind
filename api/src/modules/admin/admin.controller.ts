import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
@Roles(AuthRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('batch-jobs')
    @ApiOperation({ summary: 'List all OpenAI batch jobs (super-admin only)' })
    listBatchJobs(@Query() query: ListBatchJobsDto) {
        return this.adminService.listBatchJobs(query);
    }
}
