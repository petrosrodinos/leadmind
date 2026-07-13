import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    Channel,
    Contact,
    ExternalIntegrationProvider,
    InteractionType,
    MsgStatus,
    OutreachMessage,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { SmtpMailService } from '@/integrations/notifications/smtp/services/mail.service';
import { CallsService } from '@/integrations/notifications/twillio/services/calls.service';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';
import { EmailConfig } from '@/shared/config/email';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { EmailCredentialsService } from '@/modules/integrations/services/email-credentials.service';
import { EmailProviderTarget } from '@/modules/integrations/interfaces/email-credentials.interface';
import { SenderProfilesService } from '@/modules/sender-profiles/sender-profiles.service';
import {
    buildEmailProviderMetadata,
    parseEmailProviderMetadata,
} from '@/modules/outreach/utils/email-provider-allocation.util';
import { parseSenderProfileMetadata } from '@/modules/outreach/utils/sender-profile-metadata.util';
import { OutreachRenderService } from './outreach-render.service';

export interface DeliveredMessage {
    provider_message_id: string | null;
    integration_metadata?: Record<string, string>;
}

@Injectable()
export class MessageSendService {
    private readonly logger = new Logger(MessageSendService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly resendMailService: ResendMailService,
        private readonly smtpMailService: SmtpMailService,
        private readonly emailCredentialsService: EmailCredentialsService,
        private readonly twillioSmsService: TwillioSmsService,
        private readonly callsService: CallsService,
        private readonly outreachRenderService: OutreachRenderService,
        private readonly senderProfilesService: SenderProfilesService,
    ) { }

    async deliverOutreachMessage(
        message: OutreachMessage & { contact: Contact },
        providerOverride?: EmailProviderTarget,
    ): Promise<DeliveredMessage> {
        this.logger.log(
            `Deliver outreach message=${message.uuid} channel=${message.channel} user=${message.user_uuid} contact=${message.contact_uuid}`,
        );

        if (message.channel === Channel.PHONE_CALL) {
            if (!message.contact.phone) {
                throw new Error('Contact has no phone');
            }
            const script = message.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (!script) {
                throw new Error('Call script cannot be empty');
            }
            const result: any = await this.callsService.makeCall({
                to: message.contact.phone,
                message: script,
            });
            const provider_message_id = result?.sid ?? null;
            return { provider_message_id };
        }

        const rendered = await this.outreachRenderService.renderForOutreachMessage(
            message.user_uuid,
            {
                subject: message.subject,
                content: message.content,
                campaign_uuid: message.campaign_uuid,
                metadata: message.metadata,
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
            const createEmail = {
                to: message.contact.email,
                subject: rendered.subject ?? 'Outreach message',
                html,
                headers,
                replyTo,
            };

            const target =
                providerOverride ??
                parseEmailProviderMetadata(message.metadata) ??
                (await this.emailCredentialsService.resolveDefaultTarget(message.user_uuid));

            this.logger.log(
                `Email send message=${message.uuid} to=${message.contact.email} subject="${rendered.subject ?? 'Outreach message'}" provider=${target?.provider ?? 'none'} account=${target?.account ?? 'none'} replyTo=${replyTo}`,
            );

            const { result, deliveryTarget } = await this.sendEmailWithProvider(
                message.user_uuid,
                createEmail,
                target,
            );
            const provider_message_id =
                result?.data?.id ?? result?.id ?? null;
            if (!provider_message_id) {
                this.logger.error(
                    `Email provider returned no message id message=${message.uuid} provider=${deliveryTarget.provider} account=${deliveryTarget.account} result=${JSON.stringify(result)}`,
                );
                throw new Error('Email provider did not confirm delivery');
            }
            this.logger.log(
                `Email delivered message=${message.uuid} providerMessageId=${provider_message_id}`,
            );
            return {
                provider_message_id,
                integration_metadata: buildEmailProviderMetadata(deliveryTarget),
            };
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
            return {
                provider_message_id,
                integration_metadata: { sms_provider: 'TWILIO' },
            };
        }

        throw new Error(`Channel ${message.channel} not implemented`);
    }

    private async sendEmailWithProvider(
        user_uuid: string,
        createEmail: {
            to: string;
            subject: string;
            html: string;
            headers: Record<string, string>;
            replyTo: string;
        },
        target: EmailProviderTarget | null,
    ): Promise<{ result: any; deliveryTarget: EmailProviderTarget }> {
        if (target?.provider === ExternalIntegrationProvider.SMTP) {
            this.logger.log(
                `Using SMTP account=${target.account} user=${user_uuid} to=${createEmail.to}`,
            );
            const smtpConfig = await this.emailCredentialsService.getSmtpConfig(
                user_uuid,
                target.account,
            );
            const result = await this.smtpMailService.sendEmail(
                { ...createEmail, from: smtpConfig.fromEmail },
                smtpConfig,
            );
            return { result, deliveryTarget: target };
        }

        if (target?.provider === ExternalIntegrationProvider.RESEND) {
            this.logger.log(
                `Using Resend account=${target.account} user=${user_uuid} to=${createEmail.to}`,
            );
            const apiKey = await this.emailCredentialsService.getResendApiKey(
                user_uuid,
                target.account,
            );
            const result = await this.resendMailService.sendEmail(createEmail, apiKey);
            return { result, deliveryTarget: target };
        }

        const envKey = this.configService.get<string>('RESEND_API_KEY');
        if (envKey) {
            this.logger.log(
                `Using Resend env RESEND_API_KEY to=${createEmail.to} (no integration target)`,
            );
            const result = await this.resendMailService.sendEmail(createEmail, envKey);
            return {
                result,
                deliveryTarget: {
                    provider: ExternalIntegrationProvider.RESEND,
                    account: 'env',
                },
            };
        }

        this.logger.error(
            `No email provider configured user=${user_uuid} to=${createEmail.to} target=${JSON.stringify(target)} envResend=${envKey ? 'set' : 'missing'}`,
        );
        throw new Error('No email provider configured');
    }

    private integrationColumnsFromMetadata(
        integration_metadata?: Record<string, string>,
    ): Pick<
        Prisma.OutreachMessageUpdateInput,
        'email_provider' | 'email_account' | 'sms_provider'
    > {
        if (!integration_metadata) {
            return {
                email_provider: null,
                email_account: null,
                sms_provider: null,
            };
        }

        const emailProvider = integration_metadata.email_provider;
        const emailAccount = integration_metadata.email_account;
        const smsProvider = integration_metadata.sms_provider;

        return {
            email_provider:
                emailProvider === ExternalIntegrationProvider.RESEND ||
                emailProvider === ExternalIntegrationProvider.SMTP
                    ? emailProvider
                    : null,
            email_account: emailAccount ?? null,
            sms_provider: smsProvider ?? null,
        };
    }

    buildSentMetadata(
        existing: unknown,
        integration_metadata?: Record<string, string>,
    ): Prisma.InputJsonValue | typeof Prisma.DbNull {
        const base =
            existing && typeof existing === 'object' && !Array.isArray(existing)
                ? { ...(existing as Record<string, unknown>) }
                : {};
        delete base.error;
        if (integration_metadata) {
            Object.assign(base, integration_metadata);
        }
        return Object.keys(base).length > 0 ? (base as Prisma.InputJsonValue) : Prisma.DbNull;
    }

    messageSentOperation(
        message_uuid: string,
        provider_message_id: string | null,
        existingMetadata: unknown,
        integration_metadata?: Record<string, string>,
    ) {
        const metadata = this.buildSentMetadata(existingMetadata, integration_metadata);
        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: {
                status: MsgStatus.SENT,
                sent_at: new Date(),
                provider_message_id,
                metadata,
                ...this.integrationColumnsFromMetadata(integration_metadata),
            },
        });
    }

    messageFailedOperation(message_uuid: string, error_message: string) {
        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: {
                status: MsgStatus.FAILED,
                sent_at: null,
                provider_message_id: null,
                metadata: { error: error_message } as Prisma.InputJsonValue,
            },
        });
    }

    messageFailedOperationPreservingProvider(
        message_uuid: string,
        error_message: string,
        existingMetadata?: unknown,
    ) {
        const provider = parseEmailProviderMetadata(existingMetadata ?? null);
        const metadata: Record<string, unknown> = { error: error_message };
        const integration_metadata: Record<string, string> = {};
        if (provider) {
            metadata.email_provider = provider.provider;
            metadata.email_account = provider.account;
            integration_metadata.email_provider = provider.provider;
            integration_metadata.email_account = provider.account;
        }
        return this.prisma.outreachMessage.update({
            where: { uuid: message_uuid },
            data: {
                status: MsgStatus.FAILED,
                sent_at: null,
                provider_message_id: null,
                metadata: metadata as Prisma.InputJsonValue,
                ...this.integrationColumnsFromMetadata(integration_metadata),
            },
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

        const metadataUuid = parseSenderProfileMetadata(message.metadata);
        if (metadataUuid) {
            try {
                const profile = await this.senderProfilesService.findOne(
                    message.user_uuid,
                    metadataUuid,
                );
                if (profile.email?.trim()) {
                    return profile.email.trim();
                }
            } catch {
                // fall through
            }
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
