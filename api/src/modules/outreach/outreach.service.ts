import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
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
import { ListMessagesDto, SendSource } from './dto/list-messages.dto';
import { SendOutreachDto } from './dto/send-outreach.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
    buildEmailProviderMetadata,
    mergeEmailProviderMetadata,
} from './utils/email-provider-allocation.util';
import { EmailCredentialsService } from '@/modules/integrations/services/email-credentials.service';
import { SendExistingMessageDto } from './dto/email-provider.dto';
import { SenderProfilesService } from '@/modules/sender-profiles/sender-profiles.service';
import {
    mergeSenderProfileMetadata,
} from './utils/sender-profile-metadata.util';

@Injectable()
export class OutreachService {
    private readonly logger = new Logger(OutreachService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailCredentialsService: EmailCredentialsService,
        private readonly senderProfilesService: SenderProfilesService,
        @InjectQueue(OUTREACH_SEND_QUEUE) private readonly outreachSendQueue: Queue,
    ) { }

    async createAndQueue(user_uuid: string, dto: SendOutreachDto): Promise<OutreachMessage> {
        const { content } = this.normalizeContentForChannel(dto.channel, dto.content);
        const contact = await this.requireOwnedContact(user_uuid, dto.contact_uuid);
        const scheduled_at = dto.scheduled_at ? new Date(dto.scheduled_at) : undefined;
        const metadata = await this.resolveMessageMetadata(user_uuid, dto);
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
        const metadata = await this.resolveMessageMetadata(user_uuid, dto);
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

    private async resolveMessageMetadata(user_uuid: string, dto: SendOutreachDto) {
        let metadata: Record<string, unknown> = {};

        if (dto.channel === Channel.EMAIL) {
            if (dto.email_provider && dto.email_account) {
                await this.emailCredentialsService.assertSendableAccount(
                    user_uuid,
                    dto.email_provider,
                    dto.email_account,
                );
                metadata = {
                    ...metadata,
                    ...buildEmailProviderMetadata({
                        provider: dto.email_provider,
                        account: dto.email_account.trim(),
                    }),
                };
            } else {
                const defaultTarget = await this.emailCredentialsService.resolveDefaultTarget(user_uuid);
                if (defaultTarget) {
                    metadata = {
                        ...metadata,
                        ...buildEmailProviderMetadata(defaultTarget),
                    };
                }
            }
        }

        const senderUuid = await this.resolveSenderProfileUuid(user_uuid, dto.sender_profile_uuid);
        if (senderUuid) {
            metadata = mergeSenderProfileMetadata(metadata, senderUuid);
        }

        return Object.keys(metadata).length > 0 ? metadata : null;
    }

    private async resolveSenderProfileUuid(
        user_uuid: string,
        requestedUuid?: string,
    ): Promise<string | null> {
        if (requestedUuid) {
            await this.senderProfilesService.findOne(user_uuid, requestedUuid);
            return requestedUuid;
        }
        const defaultProfile = await this.senderProfilesService.findDefault(user_uuid);
        return defaultProfile?.uuid ?? null;
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
        this.ensureEditable(message);

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

        if (dto.sender_profile_uuid) {
            await this.senderProfilesService.findOne(user_uuid, dto.sender_profile_uuid);
            message = await this.prisma.outreachMessage.update({
                where: { uuid: message_uuid },
                data: {
                    metadata: mergeSenderProfileMetadata(
                        message.metadata,
                        dto.sender_profile_uuid,
                    ) as Prisma.InputJsonValue,
                },
            });
        }

        if (message.status === MsgStatus.PENDING) {
            const job = await this.enqueueMessage(message.uuid, message.scheduled_at ?? undefined);
            return { jobId: String(job.id) };
        }

        if (message.status === MsgStatus.QUEUED) {
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

        throw new ConflictException('Only pending, queued, or failed messages can be sent');
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
            ...(filters.campaign_uuid && { campaign_uuid: filters.campaign_uuid }),
            ...(filters.status && { status: filters.status }),
            ...(filters.channel && { channel: filters.channel }),
            ...(filters.source === SendSource.DIRECT && { campaign_uuid: null }),
            ...(filters.source === SendSource.CAMPAIGN && { campaign_uuid: { not: null } }),
            ...(filters.email_provider && { email_provider: filters.email_provider }),
            ...(filters.history_only && {
                status: { notIn: [MsgStatus.PENDING, MsgStatus.QUEUED] },
            }),
            ...((filters.date_from || filters.date_to) && {
                sent_at: {
                    ...(filters.date_from && { gte: new Date(filters.date_from) }),
                    ...(filters.date_to && { lte: new Date(filters.date_to) }),
                },
            }),
            ...(filters.search?.trim() && {
                contact: {
                    OR: [
                        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
                        { email: { contains: filters.search.trim(), mode: 'insensitive' } },
                        { phone: { contains: filters.search.trim(), mode: 'insensitive' } },
                    ],
                },
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.outreachMessage.findMany({
                where,
                include: {
                    contact: {
                        select: {
                            uuid: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    campaign: {
                        select: {
                            uuid: true,
                            name: true,
                        },
                    },
                },
                orderBy: [{ sent_at: 'desc' }, { created_at: 'desc' }],
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

    private async removeStaleOutreachSendJob(message_uuid: string): Promise<void> {
        const existing = await this.outreachSendQueue.getJob(message_uuid);
        if (!existing) {
            return;
        }
        const state = await existing.getState();
        if (state === 'active') {
            this.logger.warn(
                `Outreach job still active message=${message_uuid}; not enqueueing duplicate`,
            );
            throw new ConflictException('Message is already being sent');
        }
        await existing.remove();
        this.logger.log(`Removed stale outreach job message=${message_uuid} state=${state}`);
    }

    private async enqueueMessage(message_uuid: string, scheduled_at?: Date) {
        await this.removeStaleOutreachSendJob(message_uuid);

        const delay = scheduled_at ? Math.max(0, scheduled_at.getTime() - Date.now()) : 0;
        const job = await this.outreachSendQueue.add(
            `outreach-send:${message_uuid}`,
            { message_uuid },
            {
                delay,
                jobId: message_uuid,
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        );
        this.logger.log(
            `Outreach message queued message=${message_uuid} jobId=${job.id} delayMs=${delay}`,
        );
        return job;
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

    private ensureEditable(message: OutreachMessage): void {
        if (message.status === MsgStatus.QUEUED) {
            throw new ConflictException('Cannot modify a message while it is queued for send');
        }
        if (message.campaign_uuid) {
            return;
        }
        this.ensurePending(message);
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
