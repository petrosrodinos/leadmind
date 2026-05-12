import { Injectable, Logger } from '@nestjs/common';
import {
    CampaignContactStatus,
    InteractionType,
    MsgStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CampaignMessageSendService } from '@/modules/marketing-campaigns/services/campaign-message-send.service';

export type WebhookEvent =
    | { kind: 'delivered'; channel: 'email' | 'sms'; provider_message_id: string; metadata?: any }
    | { kind: 'opened'; provider_message_id: string; metadata?: any }
    | { kind: 'clicked'; provider_message_id: string; metadata?: any }
    | { kind: 'bounced'; provider_message_id: string; metadata?: any }
    | { kind: 'failed'; channel: 'email' | 'sms'; provider_message_id: string; metadata?: any }
    | { kind: 'complained'; provider_message_id: string; metadata?: any };

const STATUS_RANK: Record<MsgStatus, number> = {
    PENDING: 0,
    QUEUED: 1,
    SENT: 2,
    FAILED: 3,
    BOUNCED: 3,
    UNSUBSCRIBED: 3,
    SKIPPED: 3,
    DELIVERED: 4,
    OPENED: 5,
    CLICKED: 6,
    REPLIED: 7,
};

@Injectable()
export class WebhookEventService {
    private readonly logger = new Logger(WebhookEventService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly campaignSendService: CampaignMessageSendService,
    ) { }

    async ingest(event: WebhookEvent): Promise<void> {
        const message = await this.prisma.outreachMessage.findFirst({
            where: { provider_message_id: event.provider_message_id },
        });
        if (!message) {
            this.logger.warn(
                `Webhook event ${event.kind} — no OutreachMessage with provider_message_id=${event.provider_message_id}`,
            );
            return;
        }

        const now = new Date();
        const updates: Prisma.OutreachMessageUpdateInput = {};
        let interactionType: InteractionType | null = null;
        let mccStatus: CampaignContactStatus | null = null;
        let counterField:
            | 'delivered_count'
            | 'opened_count'
            | 'clicked_count'
            | 'bounced_count'
            | 'replied_count'
            | 'unsubscribed_count'
            | 'failed_count'
            | null = null;

        switch (event.kind) {
            case 'delivered':
                updates.delivered_at = now;
                if (this.canProgress(message.status, MsgStatus.DELIVERED)) {
                    updates.status = MsgStatus.DELIVERED;
                }
                interactionType =
                    event.channel === 'email'
                        ? InteractionType.EMAIL_DELIVERED
                        : InteractionType.SMS_DELIVERED;
                mccStatus = CampaignContactStatus.DELIVERED;
                counterField = 'delivered_count';
                break;
            case 'opened':
                updates.opened_at = now;
                if (this.canProgress(message.status, MsgStatus.OPENED)) {
                    updates.status = MsgStatus.OPENED;
                }
                interactionType = InteractionType.EMAIL_OPENED;
                mccStatus = CampaignContactStatus.OPENED;
                counterField = 'opened_count';
                break;
            case 'clicked':
                updates.clicked_at = now;
                if (this.canProgress(message.status, MsgStatus.CLICKED)) {
                    updates.status = MsgStatus.CLICKED;
                }
                interactionType = InteractionType.LINK_CLICKED;
                mccStatus = CampaignContactStatus.CLICKED;
                counterField = 'clicked_count';
                break;
            case 'bounced':
                updates.status = MsgStatus.BOUNCED;
                interactionType = InteractionType.EMAIL_BOUNCED;
                mccStatus = CampaignContactStatus.BOUNCED;
                counterField = 'bounced_count';
                break;
            case 'failed':
                updates.status = MsgStatus.FAILED;
                interactionType =
                    event.channel === 'email'
                        ? InteractionType.EMAIL_FAILED
                        : InteractionType.SMS_FAILED;
                mccStatus = CampaignContactStatus.FAILED;
                counterField = 'failed_count';
                break;
            case 'complained':
                updates.status = MsgStatus.UNSUBSCRIBED;
                interactionType = InteractionType.UNSUBSCRIBED;
                mccStatus = CampaignContactStatus.UNSUBSCRIBED;
                counterField = 'unsubscribed_count';
                await this.prisma.contact.update({
                    where: { uuid: message.contact_uuid },
                    data: { unsubscribed_at: now },
                });
                break;
        }

        const ops: Prisma.PrismaPromise<unknown>[] = [
            this.prisma.outreachMessage.update({
                where: { uuid: message.uuid },
                data: updates,
            }),
        ];

        if (interactionType) {
            ops.push(
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: message.contact_uuid,
                        user_uuid: message.user_uuid,
                        campaign_uuid: message.campaign_uuid,
                        outreach_message_uuid: null, // unique 1:1 FK already taken by the original send interaction
                        type: interactionType,
                        metadata: event.metadata
                            ? (event.metadata as Prisma.InputJsonValue)
                            : undefined,
                    },
                }),
            );
        }

        if (message.campaign_uuid && mccStatus && counterField) {
            // Only update MCC if forward progression; same-or-later wins
            const existingMcc = await this.prisma.marketingCampaignContact.findUnique({
                where: {
                    campaign_uuid_contact_uuid_channel: {
                        campaign_uuid: message.campaign_uuid,
                        contact_uuid: message.contact_uuid,
                        channel: message.channel,
                    },
                },
            });
            if (existingMcc && this.canProgressMcc(existingMcc.status, mccStatus)) {
                ops.push(
                    this.prisma.marketingCampaignContact.update({
                        where: { uuid: existingMcc.uuid },
                        data: {
                            status: mccStatus,
                            ...(event.kind === 'delivered' && { delivered_at: now }),
                        },
                    }),
                );
                ops.push(
                    this.prisma.marketingCampaign.update({
                        where: { uuid: message.campaign_uuid },
                        data: { [counterField]: { increment: 1 } },
                    }),
                );
            }
        }

        await this.prisma.$transaction(ops);

        if (message.campaign_uuid) {
            await this.campaignSendService.checkCompletion(message.campaign_uuid);
        }
    }

    private canProgress(current: MsgStatus, next: MsgStatus): boolean {
        return STATUS_RANK[next] > STATUS_RANK[current];
    }

    private canProgressMcc(current: CampaignContactStatus, next: CampaignContactStatus): boolean {
        const order: CampaignContactStatus[] = [
            CampaignContactStatus.PENDING,
            CampaignContactStatus.QUEUED,
            CampaignContactStatus.SENT,
            CampaignContactStatus.DELIVERED,
            CampaignContactStatus.OPENED,
            CampaignContactStatus.CLICKED,
            CampaignContactStatus.REPLIED,
        ];
        if (
            current === CampaignContactStatus.FAILED ||
            current === CampaignContactStatus.SKIPPED ||
            current === CampaignContactStatus.BOUNCED ||
            current === CampaignContactStatus.UNSUBSCRIBED
        ) {
            // Terminal "negative" states don't get overwritten by positive progress
            return next === current;
        }
        const ci = order.indexOf(current);
        const ni = order.indexOf(next);
        if (ci === -1 || ni === -1) return true;
        return ni > ci;
    }
}
