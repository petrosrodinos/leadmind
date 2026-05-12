import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';
import { ListCampaignContactsDto } from './dto/list-campaign-contacts.dto';
import { ScheduleCampaignDto } from './dto/schedule-campaign.dto';
import { GenerateCampaignMessageDto } from './dto/generate-campaign-message.dto';
import { PreviewContactsDto } from './dto/preview-contacts.dto';
import { MarketingCampaignsService } from './services/marketing-campaigns.service';

@ApiTags('marketing-campaigns')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('marketing-campaigns')
export class MarketingCampaignsController {
    constructor(private readonly service: MarketingCampaignsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a draft marketing campaign' })
    @ApiResponse({ status: 201 })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateCampaignDto) {
        return this.service.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List marketing campaigns' })
    list(@CurrentUser('uuid') user_uuid: string, @Query() query: ListCampaignsDto) {
        return this.service.list(user_uuid, query);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get campaign detail with full stats' })
    findOne(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.findOne(user_uuid, uuid);
    }

    @Patch(':uuid')
    @ApiOperation({ summary: 'Update DRAFT campaign' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: UpdateCampaignDto,
    ) {
        return this.service.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a draft / cancelled / completed / failed campaign' })
    remove(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.remove(user_uuid, uuid);
    }

    @Get(':uuid/contacts')
    @ApiOperation({ summary: 'List campaign recipients with statuses' })
    listContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Query() query: ListCampaignContactsDto,
    ) {
        return this.service.listContacts(user_uuid, uuid, query);
    }

    @Post(':uuid/preview-contacts')
    @ApiOperation({ summary: 'Preview the matched contact set for a filter (no persistence)' })
    previewContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: PreviewContactsDto,
    ) {
        return this.service.previewContacts(user_uuid, uuid, dto);
    }

    @Post(':uuid/start')
    @ApiOperation({ summary: 'Start a draft campaign (immediate or at scheduled_at)' })
    start(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.start(user_uuid, uuid);
    }

    @Post(':uuid/schedule')
    @ApiOperation({ summary: 'Set scheduled_at and queue dispatch' })
    schedule(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: ScheduleCampaignDto,
    ) {
        return this.service.schedule(user_uuid, uuid, dto);
    }

    @Post(':uuid/duplicate')
    @ApiOperation({ summary: 'Duplicate a campaign as a new DRAFT' })
    duplicate(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.duplicate(user_uuid, uuid);
    }

    @Post(':uuid/rerun')
    @ApiOperation({ summary: 'Re-run a completed, cancelled, or failed campaign from scratch' })
    rerun(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.rerun(user_uuid, uuid);
    }

    @Post(':uuid/cancel')
    @ApiOperation({ summary: 'Cancel a sending or scheduled campaign' })
    cancel(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
    ) {
        return this.service.cancel(user_uuid, uuid);
    }

    @Post(':uuid/ai/generate')
    @ApiOperation({ summary: 'AI generate / improve / shorten / re-tone a campaign message' })
    generate(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: GenerateCampaignMessageDto,
    ) {
        return this.service.generateMessage(user_uuid, uuid, dto);
    }
}
