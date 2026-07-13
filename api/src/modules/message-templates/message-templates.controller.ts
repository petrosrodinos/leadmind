import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { MessageTemplatesService } from './message-templates.service';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { UpdateMessageTemplateDto } from './dto/update-message-template.dto';
import { CreateTemplateFromSourceDto } from './dto/create-template-from-source.dto';
import { GenerateTemplateMessageDto } from './dto/generate-template-message.dto';

@ApiTags('message-templates')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('message-templates')
export class MessageTemplatesController {
    constructor(private readonly messageTemplatesService: MessageTemplatesService) {}

    @Post('ai/generate')
    @ApiOperation({ summary: 'Generate or refine template content with AI' })
    generateAi(@CurrentUser('uuid') user_uuid: string, @Body() dto: GenerateTemplateMessageDto) {
        return this.messageTemplatesService.generateAi(user_uuid, dto);
    }

    @Post('from-campaign/:campaign_uuid')
    @ApiOperation({ summary: 'Create a template from an existing campaign message' })
    createFromCampaign(
        @CurrentUser('uuid') user_uuid: string,
        @Param('campaign_uuid') campaign_uuid: string,
        @Body() dto: CreateTemplateFromSourceDto,
    ) {
        return this.messageTemplatesService.createFromCampaign(user_uuid, campaign_uuid, dto);
    }

    @Post('from-message/:message_uuid')
    @ApiOperation({ summary: 'Create a template from an existing outreach message' })
    createFromMessage(
        @CurrentUser('uuid') user_uuid: string,
        @Param('message_uuid') message_uuid: string,
        @Body() dto: CreateTemplateFromSourceDto,
    ) {
        return this.messageTemplatesService.createFromMessage(user_uuid, message_uuid, dto);
    }

    @Post()
    @ApiOperation({ summary: 'Create a message template' })
    create(@CurrentUser('uuid') user_uuid: string, @Body() dto: CreateMessageTemplateDto) {
        return this.messageTemplatesService.create(user_uuid, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List message templates for the current user' })
    findAll(@CurrentUser('uuid') user_uuid: string) {
        return this.messageTemplatesService.findAll(user_uuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get a message template by uuid' })
    findOne(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.messageTemplatesService.findOne(user_uuid, uuid);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update a message template' })
    update(
        @CurrentUser('uuid') user_uuid: string,
        @Param('uuid') uuid: string,
        @Body() dto: UpdateMessageTemplateDto,
    ) {
        return this.messageTemplatesService.update(user_uuid, uuid, dto);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete a message template' })
    remove(@CurrentUser('uuid') user_uuid: string, @Param('uuid') uuid: string) {
        return this.messageTemplatesService.remove(user_uuid, uuid);
    }
}
