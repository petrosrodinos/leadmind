import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Channel, Contact, InteractionType, MsgStatus, OutreachMessage, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { OutreachRenderService } from './outreach-render.service';

export interface DeliveredMessage {
    provider_message_id: string | null;
}

@Injectable()
export class MessageSendService {
    private readonly logger = new Logger(MessageSendService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resendMailService: ResendMailService,
        private readonly twillioSmsService: TwillioSmsService,
        private readonly outreachRenderService: OutreachRenderService,
    ) { }

    async deliverOutreachMessage(
        message: OutreachMessage & { contact: Contact },
    ): Promise<DeliveredMessage> {
        const rendered = await this.outreachRenderService.renderForUser(message.user_uuid, {
            subject: message.subject,
            content: message.content,
        });

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
            const result: any = await this.resendMailService.sendEmail({
                to: message.contact.email,
                subject: rendered.subject ?? 'Outreach message',
                html,
                headers,
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

    private async appendUnsubscribeFooter(contact_uuid: string, html: string): Promise<string> {
        const token = await this.getOrCreateUnsubscribeToken(contact_uuid);
        const base = process.env.PUBLIC_APP_URL || process.env.APP_URL || '';
        const url = `${base.replace(/\/$/, '')}/unsubscribe/${token}`;
        return `${html}<hr style="margin-top:24px;border:none;border-top:1px solid #eee"/><p style="font-size:12px;color:#888;text-align:center;margin-top:12px">Don't want these emails? <a href="${url}" style="color:#888">Unsubscribe</a>.</p>`;
    }
}
