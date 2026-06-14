import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { ContactListsService } from './contact-lists.service';
import { CreateContactListDto } from './dto/create-contact-list.dto';
import { UpdateContactListDto } from './dto/update-contact-list.dto';
import { ListContactListsDto } from './dto/list-contact-lists.dto';
import { AddListContactsDto } from './dto/add-list-contacts.dto';
import { BulkAddListContactsDto } from './dto/bulk-add-list-contacts.dto';
import { ListContactListMembersDto } from './dto/list-contact-list-members.dto';
import { ContactAudienceStatsService } from '@/modules/contact-audience-stats/contact-audience-stats.service';
import { ContactAudienceAnalysisService } from '@/modules/contact-audience-stats/contact-audience-analysis.service';
import { ContactAudienceStatsQueryDto } from '@/modules/contact-audience-stats/dto/contact-audience-stats-query.dto';
import { ListContactAudienceAnalysesDto } from '@/modules/contact-audience-stats/dto/list-contact-audience-analyses.dto';

@ApiTags('contact-lists')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('contact-lists')
export class ContactListsController {
    constructor(
        private readonly contactListsService: ContactListsService,
        private readonly contactAudienceStatsService: ContactAudienceStatsService,
        private readonly contactAudienceAnalysisService: ContactAudienceAnalysisService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a contact list' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateContactListDto) {
        return this.contactListsService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List contact lists' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListContactListsDto) {
        return this.contactListsService.findAll(user_uuid, query);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a contact list' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactListsService.findOne(user_uuid, uuid);
    }

    @Patch(':uuid')
    @ApiOperation({ summary: 'Update a contact list' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateContactListDto,
    ) {
        return this.contactListsService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a contact list' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactListsService.remove(user_uuid, uuid);
    }

    @Get(':uuid/contacts')
    @ApiOperation({ summary: 'List contacts in a contact list' })
    findMembers(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ListContactListMembersDto,
    ) {
        return this.contactListsService.findMembers(user_uuid, uuid, query);
    }

    @Post(':uuid/contacts')
    @ApiOperation({ summary: 'Add contacts to a list' })
    addContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: AddListContactsDto,
    ) {
        return this.contactListsService.addContacts(user_uuid, uuid, dto);
    }

    @Post(':uuid/contacts/bulk')
    @ApiOperation({ summary: 'Add all contacts matching filters to a list' })
    bulkAddContacts(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: BulkAddListContactsDto,
    ) {
        return this.contactListsService.bulkAddContacts(user_uuid, uuid, dto);
    }

    @Delete(':uuid/contacts/:contactUuid')
    @ApiOperation({ summary: 'Remove a contact from a list' })
    removeContact(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Param('contactUuid') contactUuid: string,
    ) {
        return this.contactListsService.removeContact(user_uuid, uuid, contactUuid);
    }

    @Get(':uuid/stats')
    @ApiOperation({ summary: 'CRM and activity analytics for contacts in a list' })
    getStats(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ContactAudienceStatsQueryDto,
    ) {
        return this.contactAudienceStatsService.getListStats(user_uuid, uuid, query);
    }

    @Get(':uuid/analyses')
    @ApiOperation({ summary: 'List AI audience analyses for a contact list' })
    listAnalyses(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ListContactAudienceAnalysesDto,
    ) {
        return this.contactAudienceAnalysisService.listListAnalyses(user_uuid, uuid, query);
    }

    @Post(':uuid/analyses')
    @ApiOperation({ summary: 'Run a new AI audience analysis for a contact list (full history stats)' })
    createAnalysis(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.contactAudienceAnalysisService.createListAnalysis(user_uuid, uuid);
    }

    @Delete(':uuid/analyses/:analysisUuid')
    @ApiOperation({ summary: 'Delete an AI audience analysis for a contact list' })
    deleteAnalysis(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Param('analysisUuid') analysisUuid: string,
    ) {
        return this.contactAudienceAnalysisService.deleteListAnalysis(user_uuid, uuid, analysisUuid);
    }
}
