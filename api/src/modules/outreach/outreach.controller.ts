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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { MsgStatus } from '@/generated/prisma';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { AssignSequenceDto } from './dto/assign-sequence.dto';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendOutreachDto } from './dto/send-outreach.dto';
import { SendExistingMessageDto } from './dto/email-provider.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { OutreachService } from './outreach.service';

@ApiTags('outreach')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('outreach')
export class OutreachController {
    constructor(private readonly outreachService: OutreachService) { }

    @Get('messages')
    @ApiOperation({ summary: 'List outreach messages for current user' })
    @ApiQuery({ name: 'contact_uuid', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: MsgStatus })
    @ApiResponse({ status: 200 })
    listMessages(@CurrentUser('uuid') user_uuid: string, @Query() query: ListMessagesDto) {
        return this.outreachService.listMessages(user_uuid, query);
    }

    @Put('messages/:uuid')
    @ApiOperation({ summary: 'Update pending outreach message' })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 409, description: 'Only pending messages can be edited' })
    updateMessage(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') message_uuid: string,
        @Body() dto: UpdateMessageDto,
    ) {
        return this.outreachService.updateMessage(user_uuid, message_uuid, dto);
    }

    @Post('messages/:uuid/send')
    @ApiOperation({ summary: 'Enqueue outreach message for sending (or retry a failed message)' })
    @ApiResponse({ status: 201 })
    @ApiResponse({ status: 409, description: 'Only pending or failed messages can be sent' })
    sendMessage(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') message_uuid: string,
        @Body() dto: SendExistingMessageDto = {},
    ) {
        return this.outreachService.sendMessage(user_uuid, message_uuid, dto);
    }

    @Delete('messages/:uuid')
    @ApiOperation({ summary: 'Delete pending outreach message' })
    @ApiResponse({ status: 200 })
    @ApiResponse({ status: 409, description: 'Only pending messages can be deleted' })
    async deleteMessage(@CurrentUser('uuid') user_uuid: string, @Param('uuid') message_uuid: string) {
        await this.outreachService.deleteMessage(user_uuid, message_uuid);
        return { deleted: true };
    }

    @Post('messages')
    @ApiOperation({ summary: 'Create and enqueue outreach message' })
    @ApiResponse({ status: 201 })
    createAndQueue(@CurrentUser('uuid') user_uuid: string, @Body() dto: SendOutreachDto) {
        return this.outreachService.createAndQueue(user_uuid, dto);
    }

    @Post('messages/draft')
    @ApiOperation({ summary: 'Create a PENDING outreach message without queueing it for send' })
    @ApiResponse({ status: 201 })
    createDraft(@CurrentUser('uuid') user_uuid: string, @Body() dto: SendOutreachDto) {
        return this.outreachService.createDraft(user_uuid, dto);
    }

    @Post('sequences')
    @ApiOperation({ summary: 'Create outreach sequence' })
    @ApiResponse({ status: 201 })
    createSequence(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateSequenceDto) {
        return this.outreachService.createSequence(user_uuid, dto);
    }

    @Get('sequences')
    @ApiOperation({ summary: 'List outreach sequences for current user' })
    @ApiResponse({ status: 200 })
    listSequences(@CurrentUser('uuid') user_uuid: string) {
        return this.outreachService.listSequences(user_uuid);
    }

    @Post('sequences/:uuid/assign')
    @ApiOperation({ summary: 'Assign sequence to contact and enqueue messages' })
    @ApiResponse({ status: 201 })
    assignSequence(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') sequence_uuid: string,
        @Body() dto: AssignSequenceDto,
    ) {
        return this.outreachService.assignSequence(user_uuid, sequence_uuid, dto);
    }
}
