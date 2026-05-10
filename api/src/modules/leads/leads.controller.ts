import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { EnrichmentSource, SourceType } from '@/generated/prisma';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { EnrichLeadDto } from './dto/enrich-lead.dto';
import { ListLeadEnrichmentsDto } from './dto/list-lead-enrichments.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Get()
    @ApiOperation({ summary: 'List public leads' })
    @ApiQuery({ name: 'source_type', required: false, enum: SourceType })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: 'Paginated list of public leads' })
    findAll(@Query() query: ListLeadsDto) {
        return this.leadsService.findAll(query);
    }

    @Get(':uuid/enrichments')
    @ApiOperation({ summary: 'List enrichment history for a lead (paginated, filterable)' })
    @ApiQuery({ name: 'source', required: false, enum: EnrichmentSource })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: 'Paginated enrichment rows (newest first)' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    findEnrichments(@Param('uuid') uuid: string, @Query() query: ListLeadEnrichmentsDto) {
        return this.leadsService.findEnrichmentsForLead(uuid, query);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a public lead by uuid' })
    @ApiResponse({ status: 200, description: 'Lead found' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    findOne(@Param('uuid') uuid: string) {
        return this.leadsService.findOne(uuid);
    }

    @Post(':uuid/enrich')
    @ApiOperation({ summary: 'Enqueue AI enrichment for a lead' })
    @ApiResponse({ status: 201, description: 'Enrichment job enqueued' })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    triggerEnrich(@Param('uuid') uuid: string, @Body() dto: EnrichLeadDto) {
        return this.leadsService.triggerEnrich(uuid, dto);
    }
}
