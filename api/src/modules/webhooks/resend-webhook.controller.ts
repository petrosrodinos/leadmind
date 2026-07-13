import {
    Body,
    Controller,
    Headers,
    HttpCode,
    Logger,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { EmailCredentialsService } from '@/modules/integrations/services/email-credentials.service';
import { WebhookEvent, WebhookEventService } from './services/webhook-event.service';
import { verifyResendSignature } from './utils/verify-svix.util';

interface ResendWebhookBody {
    type: string;
    created_at?: string;
    data?: {
        email_id?: string;
        to?: string[] | string;
        subject?: string;
        from?: string;
        link?: string;
        bounce?: { reason?: string };
        click?: { link?: string };
        headers?: Array<{ name: string; value: string }>;
    };
}

function parseHeader(
    headers: Array<{ name: string; value: string }> | undefined,
    name: string,
): string | undefined {
    return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}

function parseFromAddress(from: string | undefined): string | null {
    if (!from?.trim()) {
        return null;
    }
    const match = from.match(/<([^>]+)>/);
    return (match?.[1] ?? from).trim().toLowerCase() || null;
}

@ApiTags('webhooks')
@Controller('webhooks/resend')
export class ResendWebhookController {
    private readonly logger = new Logger(ResendWebhookController.name);

    constructor(
        private readonly webhookEventService: WebhookEventService,
        private readonly prisma: PrismaService,
        private readonly emailCredentials: EmailCredentialsService,
    ) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Resend email delivery / engagement events' })
    async handle(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
        @Body() body: ResendWebhookBody,
    ): Promise<{ ok: true }> {
        this.logger.log(
            `Received Resend webhook: type=${body.type} email_id=${body.data?.email_id ?? 'none'}`,
        );

        const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(body);
        const userUuid = await this.resolveUserUuid(body);
        if (!userUuid) {
            this.logger.warn(
                `Resend webhook: could not resolve user for type=${body.type} email_id=${body.data?.email_id ?? 'none'}`,
            );
            return { ok: true };
        }

        const webhookSecrets = await this.emailCredentials.listResendWebhookSecrets(userUuid);
        if (webhookSecrets.length === 0) {
            this.logger.warn(`Resend webhook: no webhook secret for user ${userUuid}`);
            return { ok: true };
        }

        const verified = webhookSecrets.some((secret) =>
            verifyResendSignature(
                raw,
                { svixId, svixTimestamp, svixSignature },
                secret,
            ),
        );
        if (!verified) {
            this.logger.error(
                `Resend webhook signature verification failed for user ${userUuid}`,
            );
            throw new UnauthorizedException('Invalid svix signature');
        }

        if (body.type === 'email.received') {
            try {
                await this.handleReceived(body);
            } catch (error) {
                this.logger.error(
                    `Failed processing Resend event ${body.type}: ${error instanceof Error ? error.message : error}`,
                );
            }
            return { ok: true };
        }

        const event = this.toEvent(body);
        if (!event) {
            this.logger.warn(`Unhandled Resend event type: ${body.type}`);
            return { ok: true };
        }

        try {
            await this.webhookEventService.ingest(event);
            this.logger.log(`Resend event ${body.type} processed successfully`);
        } catch (error) {
            this.logger.error(
                `Failed processing Resend event ${body.type}: ${error instanceof Error ? error.message : error}`,
            );
        }
        return { ok: true };
    }

    private async resolveUserUuid(body: ResendWebhookBody): Promise<string | null> {
        if (body.type === 'email.received') {
            const from = parseFromAddress(body.data?.from);
            if (!from) {
                return null;
            }
            const contact = await this.prisma.contact.findFirst({
                where: { email: { equals: from, mode: 'insensitive' } },
                select: { user_uuid: true },
            });
            return contact?.user_uuid ?? null;
        }

        const providerMessageId = body.data?.email_id;
        if (!providerMessageId) {
            return null;
        }

        const message = await this.prisma.outreachMessage.findFirst({
            where: { provider_message_id: providerMessageId },
            select: { user_uuid: true },
        });
        return message?.user_uuid ?? null;
    }

    private async handleReceived(body: ResendWebhookBody): Promise<void> {
        const provider_received_id = body.data?.email_id;
        const from = parseFromAddress(body.data?.from);
        if (!provider_received_id || !from) {
            this.logger.warn('email.received missing email_id or from');
            return;
        }

        const provider_message_id =
            await this.webhookEventService.resolveOutboundMessageIdFromReceived(
                provider_received_id,
                from,
            );
        if (!provider_message_id) {
            this.logger.warn(
                `email.received — no matching outbound message for received=${provider_received_id} from=${from}`,
            );
            return;
        }

        await this.webhookEventService.ingest({
            kind: 'replied',
            provider_message_id,
            metadata: {
                provider_received_id,
                from,
                subject: body.data?.subject,
            },
        });
    }

    private toEvent(body: ResendWebhookBody): WebhookEvent | null {
        const provider_message_id = body.data?.email_id;
        if (!provider_message_id) return null;

        const outreach_message_uuid = parseHeader(body.data?.headers, 'X-Message-Uuid');

        switch (body.type) {
            case 'email.delivered':
                return {
                    kind: 'delivered',
                    channel: 'email',
                    provider_message_id,
                    metadata: { outreach_message_uuid },
                };
            case 'email.opened':
                return { kind: 'opened', provider_message_id, metadata: { outreach_message_uuid } };
            case 'email.clicked':
                return {
                    kind: 'clicked',
                    provider_message_id,
                    metadata: { link: body.data?.click?.link, outreach_message_uuid },
                };
            case 'email.bounced':
                return {
                    kind: 'bounced',
                    provider_message_id,
                    metadata: { reason: body.data?.bounce?.reason, outreach_message_uuid },
                };
            case 'email.complained':
                return { kind: 'complained', provider_message_id, metadata: { outreach_message_uuid } };
            case 'email.failed':
                return {
                    kind: 'failed',
                    channel: 'email',
                    provider_message_id,
                    metadata: { outreach_message_uuid },
                };
            default:
                return null;
        }
    }
}
