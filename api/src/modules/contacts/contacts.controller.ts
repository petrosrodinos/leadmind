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
import { AiDraftMessageDto } from './dto/ai-draft-message.dto';
import { BulkAiDraftMessagesDto } from './dto/bulk-ai-draft-messages.dto';
import { BulkDeleteContactsDto } from './dto/bulk-delete-contacts.dto';
import { BulkEnrichContactsDto } from './dto/bulk-enrich-contacts.dto';
import { BulkScrapeContactEmailsDto } from './dto/bulk-scrape-contact-emails.dto';
import { BulkTriggerScoreDto } from './dto/bulk-trigger-score.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsDto } from './dto/list-contacts.dto';
import { LogCallDto } from './dto/log-call.dto';
import { LogEmailDto } from './dto/log-email.dto';
import { LogMeetingDto } from './dto/log-meeting.dto';
import { LogSmsDto } from './dto/log-sms.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { EnrichContactDto } from './dto/enrich-contact.dto';
import { TriggerScoreDto } from './dto/trigger-score.dto';
import { ListEnrichmentsDto } from '@/modules/enrichment/dto/list-enrichments.dto';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    @ApiOperation({
        summary:
            'Create a contact (creates a MANUAL Lead behind the scenes). If email already exists for this user, links the selected filter to that contact and returns it.',
    })
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
    @ApiOperation({
        summary:
            'Adopt a public Lead as a Contact for the current user. Returns existing contact if already adopted or email already matches.',
    })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    convertFromLead(
        @CurrentUser('uuid') user_uuid: string,
        @Param('lead_uuid') lead_uuid: string,
    ) {
        return this.contactsService.convertFromLead(user_uuid, lead_uuid);
    }

    @Get('tags')
    @ApiOperation({ summary: 'List all distinct tag strings for the current user contacts' })
    getUserTags(@CurrentUser('uuid') user_uuid: string) {
        return this.contactsService.getUserTags(user_uuid);
    }

    @Post('bulk-ai-draft-messages')
    @ApiOperation({
        summary: 'Generate personalized AI drafts for multiple contacts (one message per contact)',
    })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404 })
    triggerBulkAiDraftMessages(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: BulkAiDraftMessagesDto,
    ) {
        return this.contactsService.triggerBulkAiDraftMessages(user_uuid, dto);
    }

    @Post('bulk-enrich')
    @ApiOperation({ summary: 'Queue enrichment for multiple contacts (same sources for all)' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404 })
    triggerBulkEnrich(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: BulkEnrichContactsDto,
    ) {
        return this.contactsService.triggerBulkEnrich(user_uuid, dto);
    }

    @Post('bulk-score')
    @ApiOperation({ summary: 'Trigger AI scoring for multiple contacts (rules scoped to selected filters)' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 400 })
    @ApiResponse({ status: 404 })
    triggerBulkScore(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: BulkTriggerScoreDto,
    ) {
        return this.contactsService.triggerBulkScore(user_uuid, dto);
    }

    @Post('bulk-scrape-emails')
    @ApiOperation({
        summary: 'Scrape contact websites to find missing emails (no email + has website only)',
    })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 400 })
    @ApiResponse({ status: 404 })
    triggerBulkScrapeEmails(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: BulkScrapeContactEmailsDto,
    ) {
        return this.contactsService.triggerBulkScrapeEmailsFromWebsites(user_uuid, dto);
    }

    @Post('bulk-delete')
    @ApiOperation({ summary: 'Delete multiple contacts' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 404 })
    removeMany(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: BulkDeleteContactsDto,
    ) {
        return this.contactsService.removeMany(user_uuid, dto);
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

    @Post(':uuid/calls')
    @ApiOperation({ summary: 'Log a call (creates an Interaction of type CALL)' })
    @ApiResponse({ status: 201 })
    logCall(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: LogCallDto,
    ) {
        return this.contactsService.logCall(user_uuid, uuid, dto);
    }

    @Post(':uuid/meetings')
    @ApiOperation({ summary: 'Log a meeting (creates an Interaction of type MEETING)' })
    @ApiResponse({ status: 201 })
    logMeeting(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: LogMeetingDto,
    ) {
        return this.contactsService.logMeeting(user_uuid, uuid, dto);
    }

    @Post(':uuid/emails')
    @ApiOperation({ summary: 'Log an email (creates an Interaction of type EMAIL)' })
    @ApiResponse({ status: 201 })
    logEmail(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: LogEmailDto,
    ) {
        return this.contactsService.logEmail(user_uuid, uuid, dto);
    }

    @Post(':uuid/sms')
    @ApiOperation({ summary: 'Log an SMS (creates an Interaction of type SMS)' })
    @ApiResponse({ status: 201 })
    logSms(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: LogSmsDto,
    ) {
        return this.contactsService.logSms(user_uuid, uuid, dto);
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
    triggerScore(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: TriggerScoreDto,
    ) {
        return this.contactsService.triggerScore(user_uuid, uuid, dto);
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

    @Post('ai-draft-message')
    @ApiOperation({
        summary: 'Generate a one-off AI draft (Email, SMS, or Call) for a contact using a free-text prompt. Returns subject + content without persisting.',
    })
    @ApiResponse({ status: 201 })
    aiDraftMessage(
        @CurrentUser('uuid') user_uuid: string,
        @Body() dto: AiDraftMessageDto,
    ) {
        return this.contactsService.draftAdHocMessage(user_uuid, dto);
    }

    @Post(':uuid/enrich')
    @ApiOperation({ summary: 'Queue contact-scoped enrichment (selected sources or filter defaults)' })
    @ApiResponse({ status: 201 })
    enrichContact(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: EnrichContactDto,
    ) {
        return this.contactsService.enrichContact(user_uuid, uuid, dto);
    }

    @Get(':uuid/enrichments')
    @ApiOperation({ summary: 'List enrichment history for a contact' })
    findEnrichments(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Query() query: ListEnrichmentsDto,
    ) {
        return this.contactsService.findEnrichmentsForContact(user_uuid, uuid, query);
    }

    @Get(':uuid/messages')
    @ApiOperation({ summary: "List the contact's outreach messages (drafts + sent)" })
    listMessages(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.contactsService.listMessages(user_uuid, uuid);
    }
}
