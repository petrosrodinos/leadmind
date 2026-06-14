import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { ListJobsDto } from './dto/list-jobs.dto';
import { ContactAudienceStatsService } from '@/modules/contact-audience-stats/contact-audience-stats.service';
import { ContactAudienceAnalysisService } from '@/modules/contact-audience-stats/contact-audience-analysis.service';
import { ContactAudienceStatsQueryDto } from '@/modules/contact-audience-stats/dto/contact-audience-stats-query.dto';
import { ListContactAudienceAnalysesDto } from '@/modules/contact-audience-stats/dto/list-contact-audience-analyses.dto';

@ApiTags('filters')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('filters')
export class FiltersController {
    constructor(
        private readonly filtersService: FiltersService,
        private readonly contactAudienceStatsService: ContactAudienceStatsService,
        private readonly contactAudienceAnalysisService: ContactAudienceAnalysisService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a filter' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateFilterDto) {
        return this.filtersService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List filters for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.filtersService.findAll(user_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a filter by uuid' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.filtersService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a filter' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateFilterDto,
    ) {
        return this.filtersService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a filter' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.filtersService.remove(user_uuid, uuid);
    }

    @Post(':uuid/run')
    @ApiOperation({ summary: 'Manually enqueue a scrape job for a filter' })
    manualRun(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.filtersService.manualRun(user_uuid, uuid);
    }

    @Get(':uuid/jobs')
    @ApiOperation({ summary: 'List FilterJob records for a filter (paginated)' })
    findJobs(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ListJobsDto,
    ) {
        return this.filtersService.findJobs(user_uuid, uuid, query);
    }

    @Get(':uuid/stats')
    @ApiOperation({ summary: 'CRM and activity analytics for contacts in a filter' })
    getStats(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ContactAudienceStatsQueryDto,
    ) {
        return this.contactAudienceStatsService.getFilterStats(user_uuid, uuid, query);
    }

    @Get(':uuid/analyses')
    @ApiOperation({ summary: 'List AI audience analyses for a filter' })
    listAnalyses(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ListContactAudienceAnalysesDto,
    ) {
        return this.contactAudienceAnalysisService.listFilterAnalyses(user_uuid, uuid, query);
    }

    @Post(':uuid/analyses')
    @ApiOperation({ summary: 'Run a new AI audience analysis for a filter (full history stats)' })
    createAnalysis(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.contactAudienceAnalysisService.createFilterAnalysis(user_uuid, uuid);
    }
}
