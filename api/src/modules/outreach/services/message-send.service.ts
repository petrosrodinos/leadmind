import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Channel, Contact, InteractionType, MsgStatus, OutreachMessage, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';
import { EmailConfig } from '@/shared/config/email';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { SenderProfilesService } from '@/modules/sender-profiles/sender-profiles.service';
import { OutreachRenderService } from './outreach-render.service';

export interface DeliveredMessage {
    provider_message_id: string | null;
}

@Injectable()
export class MessageSendService {
    private readonly logger = new Logger(MessageSendService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly resendMailService: ResendMailService,
        private readonly twillioSmsService: TwillioSmsService,
        private readonly outreachRenderService: OutreachRenderService,
        private readonly senderProfilesService: SenderProfilesService,
    ) { }

    async deliverOutreachMessage(
        message: OutreachMessage & { contact: Contact },
    ): Promise<DeliveredMessage> {
        const rendered = await this.outreachRenderService.renderForOutreachMessage(
            message.user_uuid,
            {
                subject: message.subject,
                content: message.content,
                campaign_uuid: message.campaign_uuid,
            },
            message.contact,
        );

        if (message.channel === Channel.EMAIL) {
            if (!message.contact.email) {
                throw new Error('Contact has no email');
            }
            let html = sanitizeEmailHtml(rendered.content);
            if (message.campaign_uuid) {
                html = await this.appendUnsubscribeFooter(message.contact_uuid, html);
            }
            const headers: Record<string, string> = {
                'X-Message-Uuid': message.uuid,
            };
            if (message.campaign_uuid) {
                headers['X-Campaign-Uuid'] = message.campaign_uuid;
            }
            const replyTo = await this.resolveReplyTo(message);
            const result: any = await this.resendMailService.sendEmail({
                to: message.contact.email,
                subject: rendered.subject ?? 'Outreach message',
                html,
                headers,
                replyTo,
            });
            const provider_message_id =
                result?.data?.id ?? result?.id ?? null;
            return { provider_message_id };
        }

        if (message.channel === Channel.SMS) {
            if (!message.contact.phone) {
                throw new Error('Contact has no phone');
            }
            const result: any = await this.twillioSmsService.sendSms({
                to: message.contact.phone,
                body: rendered.content,
            });
            const provider_message_id = result?.sid ?? null;
            return { provider_message_id };
        }

        throw new Error(`Channel ${message.channel} not implemented`);
    }

    messageSentOperation(message_uuid: string, provider_message_id: string | null) {
        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: { status: MsgStatus.SENT, sent_at: new Date(), provider_message_id, metadata: null },
        });
    }

    messageFailedOperation(message_uuid: string, error_message: string) {
        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: { status: MsgStatus.FAILED, metadata: { error: error_message } },
        });
    }

    contactInteractedOperation(contact_uuid: string) {
        return this.prisma.contact.update({
            where: { uuid: contact_uuid },
            data: { last_interaction_at: new Date() },
        });
    }

    interactionCreateOperation(data: {
        contact_uuid: string;
        user_uuid: string;
        type: InteractionType;
        outreach_message_uuid?: string;
        campaign_uuid?: string;
        metadata?: Prisma.InputJsonValue;
    }) {
        return this.prisma.interaction.create({ data });
    }

    async getOrCreateUnsubscribeToken(contact_uuid: string): Promise<string> {
        const contact = await this.prisma.contact.findUnique({
            where: { uuid: contact_uuid },
            select: { unsubscribe_token: true },
        });
        if (contact?.unsubscribe_token) {
            return contact.unsubscribe_token;
        }
        const token = crypto.randomBytes(24).toString('hex');
        try {
            await this.prisma.contact.update({
                where: { uuid: contact_uuid },
                data: { unsubscribe_token: token },
            });
            return token;
        } catch {
            const reread = await this.prisma.contact.findUnique({
                where: { uuid: contact_uuid },
                select: { unsubscribe_token: true },
            });
            return reread?.unsubscribe_token ?? token;
        }
    }

    private async resolveReplyTo(message: OutreachMessage): Promise<string> {
        const inbound = this.configService.get<string>('RESEND_INBOUND_REPLY_TO');
        if (inbound?.trim()) {
            return inbound.trim();
        }

        if (message.campaign_uuid) {
            const campaign = await this.prisma.marketingCampaign.findUnique({
                where: { uuid: message.campaign_uuid },
                select: { sender_profile: { select: { email: true } } },
            });
            if (campaign?.sender_profile?.email?.trim()) {
                return campaign.sender_profile.email.trim();
            }
        }

        const defaultProfile = await this.senderProfilesService.findDefault(message.user_uuid);
        if (defaultProfile?.email?.trim()) {
            return defaultProfile.email.trim();
        }

        return EmailConfig.email_addresses.confirmation;
    }

    private async appendUnsubscribeFooter(contact_uuid: string, html: string): Promise<string> {
        const token = await this.getOrCreateUnsubscribeToken(contact_uuid);
        const base = process.env.PUBLIC_APP_URL || process.env.APP_URL || '';
        const url = `${base.replace(/\/$/, '')}/unsubscribe/${token}`;
        return `${html}<hr style="margin-top:24px;border:none;border-top:1px solid #eee"/><p style="font-size:12px;color:#888;text-align:center;margin-top:12px">Don't want these emails? <a href="${url}" style="color:#888">Unsubscribe</a>.</p>`;
    }
}
