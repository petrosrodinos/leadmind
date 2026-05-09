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
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { ContactsService } from './contacts.service';
import { AddNoteDto } from './dto/add-note.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsDto } from './dto/list-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a contact (creates a MANUAL Lead behind the scenes)' })
    @ApiResponse({ status: 201 })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateContactDto) {
        return this.contactsService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List contacts for current user' })
    findAll(@CurrentUser('uuid') user_uuid: string, @Query() query: ListContactsDto) {
        return this.contactsService.findAll(user_uuid, query);
    }

    @Post('from-lead/:lead_uuid')
    @ApiOperation({ summary: 'Adopt a public Lead as a Contact for the current user' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    @ApiResponse({ status: 409, description: 'Contact already exists for this lead' })
    convertFromLead(
        @CurrentUser('uuid') user_uuid: string,
        @Param('lead_uuid') lead_uuid: string,
    ) {
        return this.contactsService.convertFromLead(user_uuid, lead_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a contact with tags, interactions, lead, and outreach messages' })
    @ApiResponse({ status: 404, description: 'Contact not found' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactsService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update contact profile fields and notes' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateContactDto,
    ) {
        return this.contactsService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a contact' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactsService.remove(user_uuid, uuid);
    }

    @Put(':uuid/status')
    @ApiOperation({ summary: 'Update contact status (records an Interaction)' })
    updateStatus(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateStatusDto,
    ) {
        return this.contactsService.updateStatus(user_uuid, uuid, dto);
    }

    @Put(':uuid/tags')
    @ApiOperation({ summary: 'Replace the contact tag set' })
    updateTags(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateTagsDto,
    ) {
        return this.contactsService.updateTags(user_uuid, uuid, dto);
    }

    @Post(':uuid/notes')
    @ApiOperation({ summary: 'Add a note (creates an Interaction of type NOTE)' })
    @ApiResponse({ status: 201 })
    addNote(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: AddNoteDto,
    ) {
        return this.contactsService.addNote(user_uuid, uuid, dto);
    }

    @Get(':uuid/interactions')
    @ApiOperation({ summary: 'List interactions for a contact (most recent first)' })
    getInteractions(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.contactsService.getInteractions(user_uuid, uuid);
    }

    @Post(':uuid/score')
    @ApiOperation({ summary: 'Trigger AI scoring for the contact' })
    @ApiResponse({ status: 201 })
    triggerScore(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactsService.triggerScore(user_uuid, uuid);
    }

    @Post(':uuid/draft-messages')
    @ApiOperation({ summary: 'Trigger AI to (re)draft OutreachMessage rows per filter channel' })
    @ApiResponse({ status: 201 })
    triggerDraftMessages(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
    ) {
        return this.contactsService.triggerDraftMessages(user_uuid, uuid);
    }

    @Get(':uuid/messages')
    @ApiOperation({ summary: "List the contact's outreach messages (drafts + sent)" })
    listMessages(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactsService.listMessages(user_uuid, uuid);
    }
}
