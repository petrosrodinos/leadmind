import { InjectQueue } from '@nestjs/bullmq';
import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import {
    CampaignContactStatus,
    CampaignStatus,
    Channel,
    ExternalIntegrationProvider,
    InteractionType,
    LeadStatus,
    MsgStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { MARKETING_MESSAGE_SEND_QUEUE } from '@/core/queues/queues.constants';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { MessageSendService } from '@/modules/outreach/services/message-send.service';
import { EmailProviderTarget } from '@/modules/integrations/interfaces/email-credentials.interface';
import { EmailCredentialsService } from '@/modules/integrations/services/email-credentials.service';
import {
    buildEmailProviderMetadata,
    mergeEmailProviderMetadata,
    parseEmailProviderMetadata,
} from '@/modules/outreach/utils/email-provider-allocation.util';
import { mergeSenderProfileMetadata } from '@/modules/outreach/utils/sender-profile-metadata.util';
import { SenderProfilesService } from '@/modules/sender-profiles/sender-profiles.service';
interface SendResult {
    status: 'sent' | 'failed' | 'skipped' | 'noop';
    reason?: string;
}

@Injectable()
export class CampaignMessageSendService {
    private readonly logger = new Logger(CampaignMessageSendService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly messageSendService: MessageSendService,
        private readonly emailCredentialsService: EmailCredentialsService,
        private readonly senderProfilesService: SenderProfilesService,
        private readonly contactsService: ContactsService,
        @InjectQueue(MARKETING_MESSAGE_SEND_QUEUE)
        private readonly messageSendQueue: Queue,
    ) { }

    async sendByMcc(mcc_uuid: string, providerOverride?: EmailProviderTarget): Promise<SendResult> {
        const mcc = await this.prisma.marketingCampaignContact.findUnique({
            where: { uuid: mcc_uuid },
            include: {
                campaign: true,
                contact: true,
            },
        });
        if (!mcc) {
            this.logger.warn(`MCC ${mcc_uuid} not found`);
            throw new NotFoundException(`Campaign contact ${mcc_uuid} not found`);
        }

        if (this.isTerminal(mcc.status)) {
            await this.checkCompletion(mcc.campaign_uuid);
            return { status: 'noop', reason: `MCC already in terminal state ${mcc.status}` };
        }

        if (mcc.campaign.status === CampaignStatus.CANCELLED) {
            await this.markSkipped(mcc.uuid, mcc.campaign_uuid, 'cancelled');
            return { status: 'skipped', reason: 'cancelled' };
        }

        if (mcc.channel === Channel.EMAIL && !mcc.contact.email) {
            await this.markSkipped(mcc.uuid, mcc.campaign_uuid, 'no_email');
            return { status: 'skipped', reason: 'no_email' };
        }
        if (mcc.channel === Channel.SMS && !mcc.contact.phone) {
            await this.markSkipped(mcc.uuid, mcc.campaign_uuid, 'no_phone');
            return { status: 'skipped', reason: 'no_phone' };
        }
        if (mcc.channel === Channel.LINKEDIN) {
            await this.markSkipped(mcc.uuid, mcc.campaign_uuid, 'linkedin_delivery_unavailable');
            return { status: 'skipped', reason: 'linkedin_delivery_unavailable' };
        }
        if (mcc.contact.unsubscribed_at) {
            await this.markSkipped(mcc.uuid, mcc.campaign_uuid, 'unsubscribed');
            return { status: 'skipped', reason: 'unsubscribed' };
        }

        const idempotency_key = `campaign:${mcc.campaign_uuid}:${mcc.contact_uuid}:${mcc.channel}`;

        let message = await this.prisma.outreachMessage.findUnique({
            where: { idempotency_key },
        });

        if (!message) {
            const subject =
                mcc.channel === Channel.EMAIL ? mcc.campaign.email_subject ?? null : null;
            const rawContent =
                mcc.channel === Channel.EMAIL
                    ? mcc.campaign.email_content ?? ''
                    : mcc.campaign.sms_content ?? '';
            const content =
                mcc.channel === Channel.EMAIL ? sanitizeEmailHtml(rawContent) : rawContent;

            try {
                message = await this.prisma.outreachMessage.create({
                    data: {
                        user_uuid: mcc.campaign.user_uuid,
                        contact_uuid: mcc.contact_uuid,
                        campaign_uuid: mcc.campaign_uuid,
                        channel: mcc.channel,
                        subject,
                        content,
                        status: MsgStatus.QUEUED,
                        idempotency_key,
                        ...(providerOverride && mcc.channel === Channel.EMAIL
                            ? {
                                  metadata: buildEmailProviderMetadata(
                                      providerOverride,
                                  ) as Prisma.InputJsonValue,
                              }
                            : {}),
                    },
                });
            } catch (error) {
                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002'
                ) {
                    message = await this.prisma.outreachMessage.findUnique({
                        where: { idempotency_key },
                    });
                    if (!message) throw error;
                } else {
                    throw error;
                }
            }
        }

        if (message.status === MsgStatus.SENT || message.status === MsgStatus.DELIVERED) {
            if (mcc.status !== CampaignContactStatus.QUEUED) {
                await this.checkCompletion(mcc.campaign_uuid);
                return { status: 'noop', reason: `Already ${message.status}` };
            }
        }

        if (providerOverride && mcc.channel === Channel.EMAIL) {
            await this.prisma.outreachMessage.update({
                where: { uuid: message.uuid },
                data: {
                    metadata: mergeEmailProviderMetadata(
                        message.metadata,
                        providerOverride,
                    ) as Prisma.InputJsonValue,
                },
            });
            message = {
                ...message,
                metadata: mergeEmailProviderMetadata(
                    message.metadata,
                    providerOverride,
                ) as Prisma.JsonValue,
            };
        }

        try {
            this.logger.log(
                `Campaign deliver mcc=${mcc.uuid} message=${message.uuid} channel=${mcc.channel} provider=${providerOverride?.provider ?? providerMeta?.provider ?? 'default'} account=${providerOverride?.account ?? providerMeta?.account ?? 'default'} to=${mcc.contact.email ?? mcc.contact.phone ?? 'unknown'}`,
            );
            const { provider_message_id, integration_metadata } =
                await this.messageSendService.deliverOutreachMessage(
                {
                    ...message,
                    contact: mcc.contact,
                },
                providerOverride,
            );

            const shouldPromoteOnSend =
                mcc.channel === Channel.EMAIL && mcc.contact.status === LeadStatus.NEW;

            await this.prisma.$transaction([
                this.messageSendService.messageSentOperation(
                    message.uuid,
                    provider_message_id,
                    message.metadata,
                    integration_metadata,
                ),
                this.prisma.marketingCampaignContact.update({
                    where: { uuid: mcc.uuid },
                    data: {
                        status: CampaignContactStatus.SENT,
                        sent_at: new Date(),
                        error_message: null,
                    },
                }),
                this.messageSendService.interactionCreateOperation({
                    contact_uuid: mcc.contact_uuid,
                    user_uuid: mcc.campaign.user_uuid,
                    campaign_uuid: mcc.campaign_uuid,
                    outreach_message_uuid: message.uuid,
                    type:
                        mcc.channel === Channel.EMAIL
                            ? InteractionType.CAMPAIGN_EMAIL_SENT
                            : InteractionType.CAMPAIGN_SMS_SENT,
                }),
                this.messageSendService.contactInteractedOperation(mcc.contact_uuid),
                this.prisma.marketingCampaign.update({
                    where: { uuid: mcc.campaign_uuid },
                    data: {
                        sent_count: { increment: 1 },
                        queued_count: { decrement: 1 },
                    },
                }),
                ...(shouldPromoteOnSend
                    ? this.contactsService.buildPromoteToContactedIfNewOps(
                          mcc.contact_uuid,
                          mcc.campaign.user_uuid,
                          'email_sent',
                          mcc.contact.status,
                      )
                    : []),
            ]);

            if (shouldPromoteOnSend) {
                await this.contactsService.syncContactSearchIndex(mcc.contact_uuid);
            }

            await this.checkCompletion(mcc.campaign_uuid);
            this.logger.log(
                `Campaign send succeeded mcc=${mcc.uuid} message=${message.uuid} providerMessageId=${provider_message_id}`,
            );
            return { status: 'sent' };
        } catch (error) {
            const error_message = error instanceof Error ? error.message : 'Unknown error';
            await this.prisma.$transaction([
                this.messageSendService.messageFailedOperationPreservingProvider(
                    message.uuid,
                    error_message,
                    message.metadata,
                ),
                this.prisma.marketingCampaignContact.update({
                    where: { uuid: mcc.uuid },
                    data: {
                        status: CampaignContactStatus.FAILED,
                        error_message,
                    },
                }),
                this.messageSendService.interactionCreateOperation({
                    contact_uuid: mcc.contact_uuid,
                    user_uuid: mcc.campaign.user_uuid,
                    campaign_uuid: mcc.campaign_uuid,
                    outreach_message_uuid: message.uuid,
                    type:
                        mcc.channel === Channel.EMAIL
                            ? InteractionType.EMAIL_FAILED
                            : InteractionType.SMS_FAILED,
                    metadata: { error: error_message } as Prisma.InputJsonValue,
                }),
                this.prisma.marketingCampaign.update({
                    where: { uuid: mcc.campaign_uuid },
                    data: {
                        failed_count: { increment: 1 },
                        queued_count: { decrement: 1 },
                    },
                }),
            ]);
            await this.checkCompletion(mcc.campaign_uuid);
            this.logger.error(`MCC ${mcc.uuid} send failed: ${error_message}`, error instanceof Error ? error.stack : undefined);
            return { status: 'failed', reason: error_message };
        }
    }

    async queueDraftMessageSend(
        user_uuid: string,
        campaign_uuid: string,
        message_uuid: string,
        providerOverride?: EmailProviderTarget,
        senderProfileUuid?: string,
    ): Promise<{ jobId: string }> {
        let message = await this.prisma.outreachMessage.findFirst({
            where: { uuid: message_uuid, campaign_uuid, user_uuid },
            include: {
                contact: { select: { email: true, phone: true, unsubscribed_at: true } },
            },
        });
        if (!message) {
            throw new NotFoundException('Message not found on this campaign');
        }

        if (message.status === MsgStatus.QUEUED) {
            throw new ConflictException('Message is already queued for send');
        }

        const campaign = await this.prisma.marketingCampaign.findFirst({
            where: { uuid: campaign_uuid, user_uuid },
        });
        if (!campaign) {
            throw new NotFoundException('Message not found on this campaign');
        }
        if (campaign.status === CampaignStatus.CANCELLED) {
            throw new ConflictException('Campaign is cancelled');
        }

        const mcc = await this.prisma.marketingCampaignContact.findUnique({
            where: {
                campaign_uuid_contact_uuid_channel: {
                    campaign_uuid,
                    contact_uuid: message.contact_uuid,
                    channel: message.channel,
                },
            },
        });
        if (!mcc) {
            throw new NotFoundException('Campaign recipient not found');
        }

        if (mcc.status === CampaignContactStatus.UNSUBSCRIBED || message.contact.unsubscribed_at) {
            throw new ConflictException('Contact has unsubscribed');
        }

        if (mcc.status === CampaignContactStatus.QUEUED) {
            throw new ConflictException('Message is already queued for send');
        }

        if (message.channel === Channel.EMAIL && !message.contact.email) {
            throw new BadRequestException('Contact has no email');
        }
        if (message.channel === Channel.SMS && !message.contact.phone) {
            throw new BadRequestException('Contact has no phone');
        }

        if (providerOverride && message.channel === Channel.EMAIL) {
            await this.emailCredentialsService.assertSendableAccount(
                user_uuid,
                providerOverride.provider,
                providerOverride.account,
            );
            message = await this.prisma.outreachMessage.update({
                where: { uuid: message_uuid },
                data: {
                    metadata: mergeEmailProviderMetadata(
                        message.metadata,
                        providerOverride,
                    ) as Prisma.InputJsonValue,
                },
                include: {
                    contact: { select: { email: true, phone: true, unsubscribed_at: true } },
                },
            });
        }

        if (senderProfileUuid) {
            await this.senderProfilesService.findOne(user_uuid, senderProfileUuid);
            message = await this.prisma.outreachMessage.update({
                where: { uuid: message_uuid },
                data: {
                    metadata: mergeSenderProfileMetadata(
                        message.metadata,
                        senderProfileUuid,
                    ) as Prisma.InputJsonValue,
                },
                include: {
                    contact: { select: { email: true, phone: true, unsubscribed_at: true } },
                },
            });
        }

        const mccWasFailed = mcc.status === CampaignContactStatus.FAILED;

        await this.prisma.$transaction(async (tx) => {
            if (message.status !== MsgStatus.PENDING) {
                await tx.outreachMessage.update({
                    where: { uuid: message_uuid },
                    data: {
                        status: MsgStatus.PENDING,
                        metadata: message.metadata,
                        sent_at: null,
                        delivered_at: null,
                        opened_at: null,
                        clicked_at: null,
                        replied_at: null,
                        provider_message_id: null,
                    },
                });
            }

            await tx.marketingCampaignContact.update({
                where: { uuid: mcc.uuid },
                data: {
                    status: CampaignContactStatus.QUEUED,
                    error_message: null,
                    sent_at: null,
                    delivered_at: null,
                },
            });

            const campaignData: Prisma.MarketingCampaignUpdateInput = {
                queued_count: { increment: 1 },
            };

            if (
                campaign.status === CampaignStatus.DRAFTS_READY ||
                campaign.status === CampaignStatus.COMPLETED
            ) {
                campaignData.status = CampaignStatus.SENDING;
                if (campaign.status === CampaignStatus.DRAFTS_READY) {
                    campaignData.started_at = new Date();
                }
                campaignData.completed_at = null;
            }

            if (mccWasFailed) {
                campaignData.failed_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.SENT) {
                campaignData.sent_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.DELIVERED) {
                campaignData.sent_count = { decrement: 1 };
                campaignData.delivered_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.OPENED) {
                campaignData.sent_count = { decrement: 1 };
                campaignData.delivered_count = { decrement: 1 };
                campaignData.opened_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.CLICKED) {
                campaignData.sent_count = { decrement: 1 };
                campaignData.delivered_count = { decrement: 1 };
                campaignData.opened_count = { decrement: 1 };
                campaignData.clicked_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.REPLIED) {
                campaignData.sent_count = { decrement: 1 };
                campaignData.delivered_count = { decrement: 1 };
                campaignData.opened_count = { decrement: 1 };
                campaignData.clicked_count = { decrement: 1 };
                campaignData.replied_count = { decrement: 1 };
            } else if (mcc.status === CampaignContactStatus.BOUNCED) {
                campaignData.bounced_count = { decrement: 1 };
            }

            await tx.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: campaignData,
            });
        });

        const provider = parseEmailProviderMetadata(message.metadata);
        const job = await this.messageSendQueue.add(
            `send-${mcc.uuid}`,
            {
                campaign_uuid,
                mcc_uuid: mcc.uuid,
                ...(provider
                    ? {
                          email_provider: provider.provider,
                          email_account: provider.account,
                      }
                    : {}),
            },
            {
                jobId: `mcc-${mcc.uuid}`,
                attempts: 3,
                backoff: { type: 'exponential', delay: 30_000 },
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        );

        return { jobId: String(job.id) };
    }

    async removeCampaignOutreachMessage(
        user_uuid: string,
        campaign_uuid: string,
        message_uuid: string,
    ): Promise<{ deleted: true }> {
        const message = await this.prisma.outreachMessage.findFirst({
            where: { uuid: message_uuid, campaign_uuid, user_uuid },
        });
        if (!message) {
            throw new NotFoundException('Message not found on this campaign');
        }

        const mcc = await this.prisma.marketingCampaignContact.findUnique({
            where: {
                campaign_uuid_contact_uuid_channel: {
                    campaign_uuid,
                    contact_uuid: message.contact_uuid,
                    channel: message.channel,
                },
            },
        });

        if (mcc?.status === CampaignContactStatus.UNSUBSCRIBED) {
            throw new ConflictException(
                'This campaign message cannot be removed in its current state.',
            );
        }

        if (mcc?.status === CampaignContactStatus.QUEUED) {
            try {
                const job = await this.messageSendQueue.getJob(`mcc-${mcc.uuid}`);
                if (job) await job.remove();
            } catch (e) {
                this.logger.warn(
                    `removeCampaignOutreachMessage job remove ${mcc.uuid}: ${e instanceof Error ? e.message : String(e)}`,
                );
            }
        }

        await this.prisma.$transaction(async (tx) => {
            const m = await tx.outreachMessage.findFirst({
                where: { uuid: message_uuid, campaign_uuid, user_uuid },
            });
            if (!m) {
                throw new NotFoundException('Message not found on this campaign');
            }

            const c = await tx.marketingCampaign.findFirst({
                where: { uuid: campaign_uuid, user_uuid },
            });
            if (!c) {
                throw new NotFoundException('Message not found on this campaign');
            }

            const row = await tx.marketingCampaignContact.findUnique({
                where: {
                    campaign_uuid_contact_uuid_channel: {
                        campaign_uuid,
                        contact_uuid: m.contact_uuid,
                        channel: m.channel,
                    },
                },
            });

            await tx.interaction.deleteMany({ where: { outreach_message_uuid: message_uuid } });
            await tx.outreachMessage.delete({ where: { uuid: message_uuid } });

            if (!row) {
                return;
            }

            if (row.status === CampaignContactStatus.PENDING) {
                await tx.marketingCampaignContact.delete({ where: { uuid: row.uuid } });
                await tx.marketingCampaign.update({
                    where: { uuid: campaign_uuid },
                    data: {
                        total_messages: Math.max(0, c.total_messages - 1),
                        selected_contact_count: Math.max(0, c.selected_contact_count - 1),
                    },
                });
                return;
            }

            if (row.status === CampaignContactStatus.QUEUED) {
                await tx.marketingCampaignContact.delete({ where: { uuid: row.uuid } });
                await tx.marketingCampaign.update({
                    where: { uuid: campaign_uuid },
                    data: {
                        total_messages: Math.max(0, c.total_messages - 1),
                        selected_contact_count: Math.max(0, c.selected_contact_count - 1),
                        queued_count: Math.max(0, c.queued_count - 1),
                    },
                });
                return;
            }

            if (row.status === CampaignContactStatus.FAILED) {
                await tx.marketingCampaignContact.update({
                    where: { uuid: row.uuid },
                    data: {
                        status: CampaignContactStatus.SKIPPED,
                        error_message: null,
                        sent_at: null,
                        delivered_at: null,
                    },
                });
                await tx.marketingCampaign.update({
                    where: { uuid: campaign_uuid },
                    data: {
                        failed_count: Math.max(0, c.failed_count - 1),
                        skipped_count: c.skipped_count + 1,
                        queued_count: c.queued_count + 1,
                    },
                });
                return;
            }

            if (row.status === CampaignContactStatus.SKIPPED) {
                return;
            }

            if (row.status === CampaignContactStatus.BOUNCED) {
                await tx.marketingCampaignContact.update({
                    where: { uuid: row.uuid },
                    data: {
                        status: CampaignContactStatus.SKIPPED,
                        error_message: null,
                        sent_at: null,
                        delivered_at: null,
                    },
                });
                await tx.marketingCampaign.update({
                    where: { uuid: campaign_uuid },
                    data: {
                        sent_count: Math.max(0, c.sent_count - 1),
                        delivered_count: Math.max(0, c.delivered_count - 1),
                        bounced_count: Math.max(0, c.bounced_count - 1),
                        skipped_count: c.skipped_count + 1,
                    },
                });
                return;
            }

            if (
                row.status === CampaignContactStatus.SENT ||
                row.status === CampaignContactStatus.DELIVERED ||
                row.status === CampaignContactStatus.OPENED ||
                row.status === CampaignContactStatus.CLICKED ||
                row.status === CampaignContactStatus.REPLIED
            ) {
                const extraDelivered = row.status !== CampaignContactStatus.SENT ? 1 : 0;
                let openedCut = 0;
                let clickedCut = 0;
                let repliedCut = 0;
                if (
                    row.status === CampaignContactStatus.OPENED ||
                    row.status === CampaignContactStatus.CLICKED ||
                    row.status === CampaignContactStatus.REPLIED
                ) {
                    openedCut = 1;
                }
                if (
                    row.status === CampaignContactStatus.CLICKED ||
                    row.status === CampaignContactStatus.REPLIED
                ) {
                    clickedCut = 1;
                }
                if (row.status === CampaignContactStatus.REPLIED) {
                    repliedCut = 1;
                }

                await tx.marketingCampaignContact.update({
                    where: { uuid: row.uuid },
                    data: {
                        status: CampaignContactStatus.SKIPPED,
                        error_message: null,
                        sent_at: null,
                        delivered_at: null,
                    },
                });

                await tx.marketingCampaign.update({
                    where: { uuid: campaign_uuid },
                    data: {
                        sent_count: Math.max(0, c.sent_count - 1),
                        delivered_count: Math.max(
                            0,
                            c.delivered_count - 1 - extraDelivered,
                        ),
                        skipped_count: c.skipped_count + 1,
                        opened_count: Math.max(0, c.opened_count - openedCut),
                        clicked_count: Math.max(0, c.clicked_count - clickedCut),
                        replied_count: Math.max(0, c.replied_count - repliedCut),
                    },
                });
            }
        });

        await this.checkCompletion(campaign_uuid);
        return { deleted: true };
    }

    private async markSkipped(
        mcc_uuid: string,
        campaign_uuid: string,
        reason: string,
    ): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.marketingCampaignContact.update({
                where: { uuid: mcc_uuid },
                data: {
                    status:
                        reason === 'unsubscribed'
                            ? CampaignContactStatus.UNSUBSCRIBED
                            : CampaignContactStatus.SKIPPED,
                    error_message: reason,
                },
            }),
            this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data:
                    reason === 'unsubscribed'
                        ? { unsubscribed_count: { increment: 1 }, queued_count: { decrement: 1 } }
                        : { skipped_count: { increment: 1 }, queued_count: { decrement: 1 } },
            }),
        ]);
        await this.checkCompletion(campaign_uuid);
    }

    private isTerminal(status: CampaignContactStatus): boolean {
        return (
            status === CampaignContactStatus.SENT ||
            status === CampaignContactStatus.FAILED ||
            status === CampaignContactStatus.SKIPPED ||
            status === CampaignContactStatus.DELIVERED ||
            status === CampaignContactStatus.OPENED ||
            status === CampaignContactStatus.CLICKED ||
            status === CampaignContactStatus.REPLIED ||
            status === CampaignContactStatus.BOUNCED ||
            status === CampaignContactStatus.UNSUBSCRIBED
        );
    }

    async checkCompletion(campaign_uuid: string): Promise<void> {
        const campaign = await this.prisma.marketingCampaign.findUnique({
            where: { uuid: campaign_uuid },
        });
        if (!campaign) return;
        if (campaign.status === CampaignStatus.COMPLETED) return;
        if (campaign.status === CampaignStatus.CANCELLED) return;
        if (campaign.total_messages === 0) return;

        const settled =
            campaign.sent_count +
            campaign.failed_count +
            campaign.skipped_count +
            campaign.unsubscribed_count;

        if (settled >= campaign.total_messages) {
            await this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: {
                    status: CampaignStatus.COMPLETED,
                    completed_at: new Date(),
                },
            });
            this.logger.log(`Campaign ${campaign_uuid} completed`);
        }
    }
}
