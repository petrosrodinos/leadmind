import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    CampaignContactStatus,
    CampaignStatus,
    Channel,
    InteractionType,
    MsgStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { MessageSendService } from '@/modules/outreach/services/message-send.service';

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
    ) { }

    async sendByMcc(mcc_uuid: string): Promise<SendResult> {
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
            return { status: 'noop', reason: `Already ${message.status}` };
        }

        try {
            const { provider_message_id } = await this.messageSendService.deliverOutreachMessage({
                ...message,
                contact: mcc.contact,
            });

            await this.prisma.$transaction([
                this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: MsgStatus.SENT,
                        sent_at: new Date(),
                        provider_message_id,
                        metadata: null,
                    },
                }),
                this.prisma.marketingCampaignContact.update({
                    where: { uuid: mcc.uuid },
                    data: {
                        status: CampaignContactStatus.SENT,
                        sent_at: new Date(),
                        error_message: null,
                    },
                }),
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: mcc.contact_uuid,
                        user_uuid: mcc.campaign.user_uuid,
                        campaign_uuid: mcc.campaign_uuid,
                        outreach_message_uuid: message.uuid,
                        type:
                            mcc.channel === Channel.EMAIL
                                ? InteractionType.CAMPAIGN_EMAIL_SENT
                                : InteractionType.CAMPAIGN_SMS_SENT,
                    },
                }),
                this.prisma.contact.update({
                    where: { uuid: mcc.contact_uuid },
                    data: { last_interaction_at: new Date() },
                }),
                this.prisma.marketingCampaign.update({
                    where: { uuid: mcc.campaign_uuid },
                    data: { sent_count: { increment: 1 } },
                }),
            ]);

            await this.checkCompletion(mcc.campaign_uuid);
            return { status: 'sent' };
        } catch (error) {
            const error_message = error instanceof Error ? error.message : 'Unknown error';
            await this.prisma.$transaction([
                this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: MsgStatus.FAILED,
                        metadata: { error: error_message },
                    },
                }),
                this.prisma.marketingCampaignContact.update({
                    where: { uuid: mcc.uuid },
                    data: {
                        status: CampaignContactStatus.FAILED,
                        error_message,
                    },
                }),
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: mcc.contact_uuid,
                        user_uuid: mcc.campaign.user_uuid,
                        campaign_uuid: mcc.campaign_uuid,
                        outreach_message_uuid: message.uuid,
                        type:
                            mcc.channel === Channel.EMAIL
                                ? InteractionType.EMAIL_FAILED
                                : InteractionType.SMS_FAILED,
                        metadata: { error: error_message } as Prisma.InputJsonValue,
                    },
                }),
                this.prisma.marketingCampaign.update({
                    where: { uuid: mcc.campaign_uuid },
                    data: { failed_count: { increment: 1 } },
                }),
            ]);
            await this.checkCompletion(mcc.campaign_uuid);
            this.logger.error(`MCC ${mcc.uuid} send failed: ${error_message}`);
            return { status: 'failed', reason: error_message };
        }
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
                        ? { unsubscribed_count: { increment: 1 } }
                        : { skipped_count: { increment: 1 } },
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
