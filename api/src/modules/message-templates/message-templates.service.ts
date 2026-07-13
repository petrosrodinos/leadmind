import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Channel } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { UpdateMessageTemplateDto } from './dto/update-message-template.dto';
import { CreateTemplateFromSourceDto } from './dto/create-template-from-source.dto';
import { GenerateTemplateMessageDto } from './dto/generate-template-message.dto';
import { TemplateAiService } from './services/template-ai.service';

function deriveChannelsFromContent(input: {
    email_content?: string | null;
    sms_content?: string | null;
}): Channel[] {
    const channels: Channel[] = [];
    if (input.email_content?.trim()) channels.push(Channel.EMAIL);
    if (input.sms_content?.trim()) channels.push(Channel.SMS);
    return channels;
}

function normalizeTemplateData(dto: CreateMessageTemplateDto | UpdateMessageTemplateDto) {
    const emailSubject = dto.email_subject?.trim() || null;
    const emailContent = dto.email_content?.trim() || null;
    const smsContent = dto.sms_content?.trim() || null;

    if (dto.channels?.includes(Channel.EMAIL) && !emailContent) {
        throw new BadRequestException('Email content is required when EMAIL channel is selected');
    }
    if (dto.channels?.includes(Channel.SMS) && !smsContent) {
        throw new BadRequestException('SMS content is required when SMS channel is selected');
    }

    return { emailSubject, emailContent, smsContent };
}

@Injectable()
export class MessageTemplatesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly templateAiService: TemplateAiService,
    ) {}

    async create(user_uuid: string, dto: CreateMessageTemplateDto) {
        const { emailSubject, emailContent, smsContent } = normalizeTemplateData(dto);
        return this.prisma.messageTemplate.create({
            data: {
                user_uuid,
                name: dto.name.trim(),
                channels: dto.channels,
                email_subject: emailSubject,
                email_content: emailContent,
                sms_content: smsContent,
            },
        });
    }

    async findAll(user_uuid: string) {
        return this.prisma.messageTemplate.findMany({
            where: { user_uuid },
            orderBy: { updated_at: 'desc' },
        });
    }

    async findOne(user_uuid: string, uuid: string) {
        const row = await this.prisma.messageTemplate.findFirst({
            where: { uuid, user_uuid },
        });
        if (!row) throw new NotFoundException(`Message template ${uuid} not found`);
        return row;
    }

    async update(user_uuid: string, uuid: string, dto: UpdateMessageTemplateDto) {
        const existing = await this.findOne(user_uuid, uuid);
        const merged: CreateMessageTemplateDto = {
            name: dto.name ?? existing.name,
            channels: dto.channels ?? existing.channels,
            email_subject: dto.email_subject ?? existing.email_subject ?? undefined,
            email_content: dto.email_content ?? existing.email_content ?? undefined,
            sms_content: dto.sms_content ?? existing.sms_content ?? undefined,
        };
        const { emailSubject, emailContent, smsContent } = normalizeTemplateData(merged);

        return this.prisma.messageTemplate.update({
            where: { uuid },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.channels !== undefined && { channels: dto.channels }),
                ...(dto.email_subject !== undefined && { email_subject: emailSubject }),
                ...(dto.email_content !== undefined && { email_content: emailContent }),
                ...(dto.sms_content !== undefined && { sms_content: smsContent }),
            },
        });
    }

    async remove(user_uuid: string, uuid: string) {
        await this.findOne(user_uuid, uuid);
        await this.prisma.messageTemplate.delete({ where: { uuid } });
        return { uuid };
    }

    async generateAi(user_uuid: string, dto: GenerateTemplateMessageDto) {
        return this.templateAiService.generate(user_uuid, dto, {});
    }

    async createFromCampaign(
        user_uuid: string,
        campaign_uuid: string,
        dto: CreateTemplateFromSourceDto,
    ) {
        const campaign = await this.prisma.marketingCampaign.findFirst({
            where: { uuid: campaign_uuid, user_uuid },
        });
        if (!campaign) throw new NotFoundException(`Campaign ${campaign_uuid} not found`);

        const emailContent = campaign.email_content?.trim() || null;
        const smsContent = campaign.sms_content?.trim() || null;

        if (!emailContent && !smsContent) {
            throw new BadRequestException('Campaign has no email or SMS content to save as a template');
        }

        const channels = deriveChannelsFromContent({ email_content: emailContent, sms_content: smsContent });
        const name = dto.name?.trim() || `${campaign.name} template`;

        return this.prisma.messageTemplate.create({
            data: {
                user_uuid,
                name,
                channels,
                email_subject: campaign.email_subject?.trim() || null,
                email_content: emailContent,
                sms_content: smsContent,
                source_campaign_uuid: campaign.uuid,
            },
        });
    }

    async createFromMessage(
        user_uuid: string,
        message_uuid: string,
        dto: CreateTemplateFromSourceDto,
    ) {
        const message = await this.prisma.outreachMessage.findFirst({
            where: { uuid: message_uuid, user_uuid },
            include: { campaign: { select: { name: true } } },
        });
        if (!message) throw new NotFoundException(`Message ${message_uuid} not found`);

        if (message.channel !== Channel.EMAIL && message.channel !== Channel.SMS) {
            throw new BadRequestException('Only email and SMS messages can be saved as templates');
        }

        const content = message.content.trim();
        if (!content) {
            throw new BadRequestException('Message has no content to save as a template');
        }

        const defaultName = message.campaign?.name
            ? `${message.campaign.name} message`
            : `${message.channel} template`;
        const name = dto.name?.trim() || defaultName;

        return this.prisma.messageTemplate.create({
            data: {
                user_uuid,
                name,
                channels: [message.channel],
                email_subject: message.channel === Channel.EMAIL ? message.subject?.trim() || null : null,
                email_content: message.channel === Channel.EMAIL ? content : null,
                sms_content: message.channel === Channel.SMS ? content : null,
                source_campaign_uuid: message.campaign_uuid,
                source_message_uuid: message.uuid,
            },
        });
    }
}
