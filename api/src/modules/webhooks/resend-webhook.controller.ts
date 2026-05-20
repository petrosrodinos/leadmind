import {
    BadRequestException,
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
import { ConfigService } from '@nestjs/config';
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
    };
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
        private readonly configService: ConfigService,
    ) { }

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
        const secret = this.configService.get<string>('RESEND_WEBHOOK_SECRET');
        if (secret) {
            const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(body);
            const ok = verifyResendSignature(
                raw,
                { svixId, svixTimestamp, svixSignature },
                secret,
            );
            if (!ok) {
                throw new UnauthorizedException('Invalid svix signature');
            }
        } else {
            this.logger.warn('RESEND_WEBHOOK_SECRET not configured — accepting webhook unverified');
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
        } catch (error) {
            this.logger.error(
                `Failed processing Resend event ${body.type}: ${error instanceof Error ? error.message : error}`,
            );
            // Return 200 to prevent retry storms; we logged the error
        }
        return { ok: true };
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

        switch (body.type) {
            case 'email.delivered':
                return {
                    kind: 'delivered',
                    channel: 'email',
                    provider_message_id,
                };
            case 'email.opened':
                return { kind: 'opened', provider_message_id };
            case 'email.clicked':
                return {
                    kind: 'clicked',
                    provider_message_id,
                    metadata: { link: body.data?.click?.link },
                };
            case 'email.bounced':
                return {
                    kind: 'bounced',
                    provider_message_id,
                    metadata: { reason: body.data?.bounce?.reason },
                };
            case 'email.complained':
                return { kind: 'complained', provider_message_id };
            case 'email.failed':
                return {
                    kind: 'failed',
                    channel: 'email',
                    provider_message_id,
                };
            default:
                return null;
        }
    }
}
