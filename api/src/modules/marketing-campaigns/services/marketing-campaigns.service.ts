import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import {
    CampaignContactStatus,
    CampaignStatus,
    Channel,
    MarketingCampaign,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
} from '@/core/queues/queues.constants';
import { isEmailHtmlEmpty, sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { ListCampaignsDto } from '../dto/list-campaigns.dto';
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto';
import { ListCampaignContactsDto } from '../dto/list-campaign-contacts.dto';
import { GenerateCampaignMessageDto } from '../dto/generate-campaign-message.dto';
import { CampaignFiltersDto } from '../dto/campaign-filters.dto';
import { PreviewContactsDto } from '../dto/preview-contacts.dto';
import { CampaignContactResolverService } from './campaign-contact-resolver.service';
import { CampaignAiService } from './campaign-ai.service';

@Injectable()
export class MarketingCampaignsService {
    private readonly logger = new Logger(MarketingCampaignsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resolver: CampaignContactResolverService,
        private readonly aiService: CampaignAiService,
        @InjectQueue(MARKETING_CAMPAIGN_DISPATCH_QUEUE)
        private readonly dispatchQueue: Queue,
        @InjectQueue(MARKETING_MESSAGE_SEND_QUEUE)
        private readonly messageSendQueue: Queue,
    ) { }

    async create(user_uuid: string, dto: CreateCampaignDto): Promise<MarketingCampaign> {
        // Drafts are loose: only enforce shape/length. Full content validation runs at start().
        this.validateContentLoose(dto.channels, dto.email_subject, dto.email_content, dto.sms_content);
        if (dto.sender_profile_uuid) {
            await this.assertOwnedSenderProfile(user_uuid, dto.sender_profile_uuid);
        }

        return this.prisma.marketingCampaign.create({
            data: {
                user_uuid,
                name: dto.name,
                description: dto.description,
                channels: dto.channels,
                email_subject: dto.email_subject ?? null,
                email_content: dto.email_content
                    ? sanitizeEmailHtml(dto.email_content)
                    : null,
                sms_content: dto.sms_content ?? null,
                sender_profile_uuid: dto.sender_profile_uuid ?? null,
                scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at) : null,
                filters_snapshot: (dto.filters ?? {}) as unknown as Prisma.InputJsonValue,
            },
        });
    }

    async update(
        user_uuid: string,
        uuid: string,
        dto: UpdateCampaignDto,
    ): Promise<MarketingCampaign> {
        const existing = await this.requireOwned(user_uuid, uuid);
        if (existing.status !== CampaignStatus.DRAFT) {
            return existing;
        }

        const channels = dto.channels ?? existing.channels;
        const email_subject = dto.email_subject ?? existing.email_subject ?? undefined;
        const email_content =
            dto.email_content !== undefined
                ? dto.email_content
                    ? sanitizeEmailHtml(dto.email_content)
                    : null
                : existing.email_content;
        const sms_content =
            dto.sms_content !== undefined ? dto.sms_content : existing.sms_content;

        // Only enforce content validity when the field is being touched; partial drafts are allowed.
        if (dto.email_content !== undefined || dto.sms_content !== undefined || dto.channels) {
            this.validateContentLoose(channels, email_subject ?? null, email_content, sms_content);
        }

        if (dto.sender_profile_uuid) {
            await this.assertOwnedSenderProfile(user_uuid, dto.sender_profile_uuid);
        }

        return this.prisma.marketingCampaign.update({
            where: { uuid },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.channels && { channels: dto.channels }),
                ...(dto.email_subject !== undefined && { email_subject: dto.email_subject }),
                ...(dto.email_content !== undefined && {
                    email_content: dto.email_content
                        ? sanitizeEmailHtml(dto.email_content)
                        : null,
                }),
                ...(dto.sms_content !== undefined && { sms_content: dto.sms_content }),
                ...(dto.sender_profile_uuid !== undefined && {
                    sender_profile_uuid: dto.sender_profile_uuid,
                }),
                ...(dto.scheduled_at !== undefined && {
                    scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at) : null,
                }),
                ...(dto.filters !== undefined && {
                    filters_snapshot: (dto.filters ?? {}) as unknown as Prisma.InputJsonValue,
                }),
            },
        });
    }

    async remove(user_uuid: string, uuid: string): Promise<{ uuid: string }> {
        const existing = await this.requireOwned(user_uuid, uuid);
        if (
            existing.status !== CampaignStatus.DRAFT &&
            existing.status !== CampaignStatus.CANCELLED &&
            existing.status !== CampaignStatus.COMPLETED &&
            existing.status !== CampaignStatus.FAILED
        ) {
            throw new ConflictException(`Cannot delete a campaign in status ${existing.status}`);
        }
        await this.prisma.marketingCampaign.delete({ where: { uuid } });
        return { uuid };
    }

    async list(user_uuid: string, query: ListCampaignsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.MarketingCampaignWhereInput = {
            user_uuid,
            ...(query.status && { status: query.status }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.marketingCampaign.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.marketingCampaign.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        return this.requireOwned(user_uuid, uuid);
    }

    async listContacts(user_uuid: string, uuid: string, query: ListCampaignContactsDto) {
        await this.requireOwned(user_uuid, uuid);

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.MarketingCampaignContactWhereInput = {
            campaign_uuid: uuid,
            ...(query.status && { status: query.status }),
            ...(query.channel && { channel: query.channel }),
            ...(query.search && {
                contact: {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { company: { contains: query.search, mode: 'insensitive' } },
                    ],
                },
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.marketingCampaignContact.findMany({
                where,
                include: { contact: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.marketingCampaignContact.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async previewContacts(
        user_uuid: string,
        uuid: string,
        dto: PreviewContactsDto,
    ): Promise<{ total: number; sample: any[]; with_email: number; with_phone: number }> {
        await this.requireOwned(user_uuid, uuid);
        return this.resolver.previewContacts(user_uuid, dto.filters, 50);
    }

    async start(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        if (campaign.status !== CampaignStatus.DRAFT) {
            throw new ConflictException(`Only DRAFT campaigns can be started (is ${campaign.status})`);
        }

        this.validateContent(
            campaign.channels,
            campaign.email_subject,
            campaign.email_content,
            campaign.sms_content,
        );
        if (!campaign.filters_snapshot) {
            throw new BadRequestException('Campaign must have an audience filter before starting');
        }

        const now = new Date();
        const scheduled =
            campaign.scheduled_at && campaign.scheduled_at.getTime() > now.getTime()
                ? campaign.scheduled_at
                : null;

        const updated = await this.prisma.marketingCampaign.update({
            where: { uuid },
            data: {
                status: scheduled ? CampaignStatus.SCHEDULED : CampaignStatus.SENDING,
                ...(scheduled ? {} : { started_at: now }),
            },
        });

        const delay = scheduled ? Math.max(0, scheduled.getTime() - now.getTime()) : 0;
        await this.dispatchQueue.add(
            `dispatch-${uuid}`,
            { campaign_uuid: uuid },
            {
                jobId: `dispatch-${uuid}`,
                delay,
                attempts: 3,
                backoff: { type: 'exponential', delay: 30_000 },
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        );
        this.logger.log(
            `Campaign ${uuid} queued for dispatch (status=${updated.status}, delay=${delay}ms)`,
        );
        return updated;
    }

    async schedule(
        user_uuid: string,
        uuid: string,
        dto: ScheduleCampaignDto,
    ): Promise<MarketingCampaign> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        if (campaign.status !== CampaignStatus.DRAFT) {
            throw new ConflictException('Only DRAFT campaigns can be scheduled');
        }
        await this.prisma.marketingCampaign.update({
            where: { uuid },
            data: { scheduled_at: new Date(dto.scheduled_at) },
        });
        return this.start(user_uuid, uuid);
    }

    async duplicate(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        return this.prisma.marketingCampaign.create({
            data: {
                user_uuid,
                name: `Copy of ${campaign.name}`,
                description: campaign.description,
                channels: campaign.channels,
                email_subject: campaign.email_subject,
                email_content: campaign.email_content,
                sms_content: campaign.sms_content,
                sender_profile_uuid: campaign.sender_profile_uuid,
                filters_snapshot: campaign.filters_snapshot ?? Prisma.JsonNull,
            },
        });
    }

    async rerun(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        const rerunnableStatuses = [
            CampaignStatus.COMPLETED,
            CampaignStatus.CANCELLED,
            CampaignStatus.FAILED,
        ];
        if (!rerunnableStatuses.includes(campaign.status as any)) {
            throw new ConflictException(
                `Only COMPLETED, CANCELLED, or FAILED campaigns can be re-run (is ${campaign.status})`,
            );
        }

        await this.removePendingJobsForCampaign(uuid);

        await this.prisma.outreachMessage.deleteMany({ where: { campaign_uuid: uuid } });
        await this.prisma.marketingCampaignContact.deleteMany({ where: { campaign_uuid: uuid } });

        await this.prisma.marketingCampaign.update({
            where: { uuid },
            data: {
                status: CampaignStatus.DRAFT,
                started_at: null,
                completed_at: null,
                cancelled_at: null,
                scheduled_at: null,
                selected_contact_count: 0,
                total_messages: 0,
                queued_count: 0,
                sent_count: 0,
                failed_count: 0,
                skipped_count: 0,
                delivered_count: 0,
                opened_count: 0,
                clicked_count: 0,
                replied_count: 0,
                bounced_count: 0,
                unsubscribed_count: 0,
            },
        });

        return this.start(user_uuid, uuid);
    }

    async cancel(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        if (
            campaign.status === CampaignStatus.COMPLETED ||
            campaign.status === CampaignStatus.CANCELLED ||
            campaign.status === CampaignStatus.FAILED
        ) {
            throw new ConflictException(`Cannot cancel a ${campaign.status} campaign`);
        }

        await this.prisma.marketingCampaign.update({
            where: { uuid },
            data: { status: CampaignStatus.CANCELLED, cancelled_at: new Date() },
        });

        await this.removePendingJobsForCampaign(uuid);

        // In-flight send jobs check campaign.status before send and short-circuit to SKIPPED.
        await this.prisma.marketingCampaignContact.updateMany({
            where: {
                campaign_uuid: uuid,
                status: { in: [CampaignContactStatus.PENDING, CampaignContactStatus.QUEUED] },
            },
            data: {
                status: CampaignContactStatus.SKIPPED,
                error_message: 'cancelled',
            },
        });

        return this.requireOwned(user_uuid, uuid);
    }

    async generateMessage(
        user_uuid: string,
        uuid: string,
        dto: GenerateCampaignMessageDto,
    ): Promise<{ subject: string | null; content: string }> {
        const campaign = await this.requireOwned(user_uuid, uuid);
        const senderDescription = await this.resolveSenderBusinessDescription(
            user_uuid,
            campaign.sender_profile_uuid,
        );
        return this.aiService.generate(dto, {
            campaign_name: campaign.name,
            campaign_description: campaign.description ?? undefined,
            sender_business_description: senderDescription,
        });
    }

    private async resolveSenderBusinessDescription(
        user_uuid: string,
        sender_profile_uuid: string | null,
    ): Promise<string | undefined> {
        const profile = sender_profile_uuid
            ? await this.prisma.senderProfile.findFirst({
                where: { uuid: sender_profile_uuid, user_uuid },
                select: { business_description: true },
            })
            : await this.prisma.senderProfile.findFirst({
                where: { user_uuid, is_default: true },
                select: { business_description: true },
            });
        return profile?.business_description ?? undefined;
    }

    private async requireOwned(user_uuid: string, uuid: string): Promise<MarketingCampaign> {
        const campaign = await this.prisma.marketingCampaign.findFirst({
            where: { uuid, user_uuid },
        });
        if (!campaign) {
            throw new NotFoundException(`Campaign ${uuid} not found`);
        }
        return campaign;
    }

    private async assertOwnedSenderProfile(user_uuid: string, uuid: string): Promise<void> {
        const profile = await this.prisma.senderProfile.findFirst({
            where: { uuid, user_uuid },
            select: { uuid: true },
        });
        if (!profile) {
            throw new NotFoundException(`Sender profile ${uuid} not found`);
        }
    }

    private validateContent(
        channels: Channel[],
        email_subject: string | null | undefined,
        email_content: string | null | undefined,
        sms_content: string | null | undefined,
    ): void {
        if (channels.includes(Channel.EMAIL)) {
            if (!email_subject || email_subject.trim().length === 0) {
                throw new BadRequestException('Email subject is required when EMAIL is selected');
            }
            if (!email_content || isEmailHtmlEmpty(email_content)) {
                throw new BadRequestException('Email body is required when EMAIL is selected');
            }
        }
        if (channels.includes(Channel.SMS)) {
            if (!sms_content || sms_content.trim().length === 0) {
                throw new BadRequestException('SMS body is required when SMS is selected');
            }
            if (sms_content.length > 1600) {
                throw new BadRequestException('SMS body cannot exceed 1600 characters');
            }
        }
    }

    private validateContentLoose(
        channels: Channel[],
        email_subject: string | null | undefined,
        email_content: string | null | undefined,
        sms_content: string | null | undefined,
    ): void {
        // For partial saves on drafts: only check max lengths / format, not required-ness.
        if (channels.includes(Channel.EMAIL) && email_content && isEmailHtmlEmpty(email_content)) {
            throw new BadRequestException('Email body cannot be empty HTML');
        }
        if (sms_content && sms_content.length > 1600) {
            throw new BadRequestException('SMS body cannot exceed 1600 characters');
        }
        if (email_subject && email_subject.length > 200) {
            throw new BadRequestException('Email subject cannot exceed 200 characters');
        }
    }

    private async removePendingJobsForCampaign(campaign_uuid: string): Promise<void> {
        // Remove the dispatch job if it hasn't fired yet
        try {
            const dispatchJob = await this.dispatchQueue.getJob(`dispatch-${campaign_uuid}`);
            if (dispatchJob) {
                await dispatchJob.remove();
            }
        } catch (error) {
            this.logger.warn(
                `Failed removing dispatch job for ${campaign_uuid}: ${error instanceof Error ? error.message : error}`,
            );
        }

        // Remove any delayed/waiting send jobs whose data references this campaign
        try {
            const jobs = await this.messageSendQueue.getJobs(['delayed', 'waiting', 'paused']);
            await Promise.all(
                jobs
                    .filter((j) => (j.data as any)?.campaign_uuid === campaign_uuid)
                    .map((j) => j.remove().catch(() => null)),
            );
        } catch (error) {
            this.logger.warn(
                `Failed removing send jobs for ${campaign_uuid}: ${error instanceof Error ? error.message : error}`,
            );
        }
    }
}
