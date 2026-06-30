import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import {
    Channel,
    Contact,
    MsgStatus,
    OutreachMessage,
    OutreachSequence,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { isEmailHtmlEmpty, sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { AssignSequenceDto } from './dto/assign-sequence.dto';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendOutreachDto } from './dto/send-outreach.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
    buildEmailProviderMetadata,
    mergeEmailProviderMetadata,
} from './utils/email-provider-allocation.util';
import { EmailCredentialsService } from '@/modules/integrations/services/email-credentials.service';
import { SendExistingMessageDto } from './dto/email-provider.dto';

@Injectable()
export class OutreachService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailCredentialsService: EmailCredentialsService,
        @InjectQueue(OUTREACH_SEND_QUEUE) private readonly outreachSendQueue: Queue,
    ) { }

    async createAndQueue(user_uuid: string, dto: SendOutreachDto): Promise<OutreachMessage> {
        const { content } = this.normalizeContentForChannel(dto.channel, dto.content);
        const contact = await this.requireOwnedContact(user_uuid, dto.contact_uuid);
        const scheduled_at = dto.scheduled_at ? new Date(dto.scheduled_at) : undefined;
        const metadata = await this.resolveEmailMetadata(user_uuid, dto);
        const message = await this.prisma.outreachMessage.create({
            data: {
                user_uuid,
                contact_uuid: contact.uuid,
                channel: dto.channel,
                subject: dto.subject,
                content,
                status: MsgStatus.PENDING,
                scheduled_at,
                ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
            },
        });
        await this.enqueueMessage(message.uuid, scheduled_at);
        return message;
    }

    async createDraft(user_uuid: string, dto: SendOutreachDto): Promise<OutreachMessage> {
        const { content } = this.normalizeContentForChannel(dto.channel, dto.content);
        const contact = await this.requireOwnedContact(user_uuid, dto.contact_uuid);
        const metadata = await this.resolveEmailMetadata(user_uuid, dto);
        return this.prisma.outreachMessage.create({
            data: {
                user_uuid,
                contact_uuid: contact.uuid,
                channel: dto.channel,
                subject: dto.subject,
                content,
                status: MsgStatus.PENDING,
                ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
            },
        });
    }

    private async resolveEmailMetadata(user_uuid: string, dto: SendOutreachDto) {
        if (dto.channel !== Channel.EMAIL) {
            return null;
        }
        if (dto.email_provider && dto.email_account) {
            await this.emailCredentialsService.assertSendableAccount(
                user_uuid,
                dto.email_provider,
                dto.email_account,
            );
            return buildEmailProviderMetadata({
                provider: dto.email_provider,
                account: dto.email_account.trim(),
            });
        }
        const defaultTarget = await this.emailCredentialsService.resolveDefaultTarget(user_uuid);
        if (!defaultTarget) {
            return null;
        }
        return buildEmailProviderMetadata(defaultTarget);
    }

    private normalizeContentForChannel(channel: Channel, content: string): { content: string } {
        if (channel !== Channel.EMAIL) return { content };
        const sanitized = sanitizeEmailHtml(content);
        if (isEmailHtmlEmpty(sanitized)) {
            throw new BadRequestException('Email body cannot be empty');
        }
        return { content: sanitized };
    }

    async updateMessage(
        user_uuid: string,
        message_uuid: string,
        dto: UpdateMessageDto,
    ): Promise<OutreachMessage> {
        const message = await this.requireOwnedMessage(user_uuid, message_uuid);
        this.ensurePending(message);

        let content = dto.content;
        if (content != null && message.channel === Channel.EMAIL) {
            const sanitized = sanitizeEmailHtml(content);
            if (isEmailHtmlEmpty(sanitized)) {
                throw new BadRequestException('Email body cannot be empty');
            }
            content = sanitized;
        }

        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: {
                subject: dto.subject,
                content,
            },
        });
    }

    async sendMessage(
        user_uuid: string,
        message_uuid: string,
        dto: SendExistingMessageDto = {},
    ): Promise<{ jobId: string }> {
        let message = await this.requireOwnedMessage(user_uuid, message_uuid);

        if (
            message.channel === Channel.EMAIL &&
            dto.email_provider &&
            dto.email_account
        ) {
            await this.emailCredentialsService.assertSendableAccount(
                user_uuid,
                dto.email_provider,
                dto.email_account,
            );
            message = await this.prisma.outreachMessage.update({
                where: { uuid: message_uuid },
                data: {
                    metadata: mergeEmailProviderMetadata(message.metadata, {
                        provider: dto.email_provider,
                        account: dto.email_account.trim(),
                    }) as Prisma.InputJsonValue,
                },
            });
        }

        if (message.status === MsgStatus.PENDING) {
            const job = await this.enqueueMessage(message.uuid, message.scheduled_at ?? undefined);
            return { jobId: String(job.id) };
        }

        if (message.status === MsgStatus.FAILED) {
            const preservedMetadata = message.metadata;
            await this.prisma.outreachMessage.update({
                where: { uuid: message_uuid },
                data: {
                    status: MsgStatus.PENDING,
                    sent_at: null,
                    metadata: preservedMetadata,
                },
            });
            const fresh = await this.requireOwnedMessage(user_uuid, message_uuid);
            const job = await this.enqueueMessage(message_uuid, fresh.scheduled_at ?? undefined);
            return { jobId: String(job.id) };
        }

        throw new ConflictException('Only pending or failed messages can be sent');
    }

    async deleteMessage(user_uuid: string, message_uuid: string): Promise<void> {
        const message = await this.requireOwnedMessage(user_uuid, message_uuid);
        this.ensurePending(message);
        await this.prisma.outreachMessage.delete({ where: { uuid: message_uuid } });
    }

    async listMessages(user_uuid: string, filters: ListMessagesDto) {
        if (filters.contact_uuid) {
            await this.requireOwnedContact(user_uuid, filters.contact_uuid);
        }

        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const skip = (page - 1) * limit;
        const where: Prisma.OutreachMessageWhereInput = {
            user_uuid,
            ...(filters.contact_uuid && { contact_uuid: filters.contact_uuid }),
            ...(filters.status && { status: filters.status }),
        };

        const [data, total] = await Promise.all([
            this.prisma.outreachMessage.findMany({
                where,
                include: { contact: { include: { lead: true } } },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.outreachMessage.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async createSequence(user_uuid: string, dto: CreateSequenceDto): Promise<OutreachSequence> {
        return this.prisma.outreachSequence.create({
            data: {
                user_uuid,
                name: dto.name,
                steps: dto.steps as unknown as Prisma.InputJsonValue,
            },
        });
    }

    async assignSequence(
        user_uuid: string,
        sequence_uuid: string,
        dto: AssignSequenceDto,
    ): Promise<{ created: number }> {
        const [sequence, contact] = await Promise.all([
            this.requireOwnedSequence(user_uuid, sequence_uuid),
            this.requireOwnedContact(user_uuid, dto.contact_uuid),
        ]);

        const steps = this.parseSequenceSteps(sequence.steps);
        const created = await Promise.all(
            steps.map(async (step) => {
                const scheduled_at = new Date(Date.now() + step.delayHours * 60 * 60 * 1000);
                const content = this.renderTemplate(step.template, contact);
                const message = await this.prisma.outreachMessage.create({
                    data: {
                        user_uuid,
                        contact_uuid: contact.uuid,
                        channel: step.channel,
                        content,
                        status: MsgStatus.PENDING,
                        scheduled_at,
                    },
                });
                await this.enqueueMessage(message.uuid, scheduled_at);
                return message;
            }),
        );

        return { created: created.length };
    }

    async listSequences(user_uuid: string): Promise<OutreachSequence[]> {
        return this.prisma.outreachSequence.findMany({
            where: { user_uuid },
            orderBy: { created_at: 'desc' },
        });
    }

    private async enqueueMessage(message_uuid: string, scheduled_at?: Date) {
        const delay = scheduled_at ? Math.max(0, scheduled_at.getTime() - Date.now()) : 0;
        return this.outreachSendQueue.add(
            `outreach-send:${message_uuid}`,
            { message_uuid },
            { delay, removeOnComplete: 100, removeOnFail: 100 },
        );
    }

    private async requireOwnedContact(user_uuid: string, contact_uuid: string) {
        const contact = await this.prisma.contact.findFirst({
            where: { uuid: contact_uuid, user_uuid },
            include: { lead: true },
        });
        if (!contact) {
            throw new ForbiddenException(`Contact ${contact_uuid} not found`);
        }
        return contact;
    }

    private async requireOwnedMessage(user_uuid: string, message_uuid: string) {
        const message = await this.prisma.outreachMessage.findFirst({
            where: { uuid: message_uuid, user_uuid },
        });
        if (!message) {
            throw new NotFoundException(`Outreach message ${message_uuid} not found`);
        }
        return message;
    }

    private async requireOwnedSequence(user_uuid: string, sequence_uuid: string) {
        const sequence = await this.prisma.outreachSequence.findFirst({
            where: { uuid: sequence_uuid, user_uuid },
        });
        if (!sequence) {
            throw new NotFoundException(`Outreach sequence ${sequence_uuid} not found`);
        }
        return sequence;
    }

    private ensurePending(message: OutreachMessage): void {
        if (message.status !== MsgStatus.PENDING) {
            throw new ConflictException('Only PENDING messages can be modified');
        }
    }

    private parseSequenceSteps(steps: Prisma.JsonValue): Array<{
        delayHours: number;
        channel: Channel;
        template: string;
    }> {
        if (!Array.isArray(steps)) {
            throw new ConflictException('Sequence steps are invalid');
        }
        return steps as Array<{
            delayHours: number;
            channel: Channel;
            template: string;
        }>;
    }

    private renderTemplate(template: string, contact: Contact) {
        return template
            .replaceAll('{{name}}', contact.name ?? '')
            .replaceAll('{{company}}', contact.company ?? '');
    }
}
