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
import { ConfigService } from '@nestjs/config';
import { validateRequest } from 'twilio';
import { WebhookEvent, WebhookEventService } from './services/webhook-event.service';

interface TwilioStatusCallback {
    MessageSid?: string;
    MessageStatus?: string;
    ErrorCode?: string;
    ErrorMessage?: string;
    To?: string;
    From?: string;
}

@ApiTags('webhooks')
@Controller('webhooks/twilio')
export class TwilioWebhookController {
    private readonly logger = new Logger(TwilioWebhookController.name);

    constructor(
        private readonly webhookEventService: WebhookEventService,
        private readonly configService: ConfigService,
    ) { }

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Twilio SMS status callback' })
    async handle(
        @Req() req: Request,
        @Headers('x-twilio-signature') signature: string,
        @Body() body: TwilioStatusCallback,
    ): Promise<{ ok: true }> {
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        const publicUrl =
            this.configService.get<string>('PUBLIC_API_URL') ??
            `${req.protocol}://${req.get('host')}`;

        if (authToken && signature) {
            const fullUrl = `${publicUrl.replace(/\/$/, '')}${req.originalUrl}`;
            const params: Record<string, string> = Object.fromEntries(
                Object.entries(body).map(([k, v]) => [k, String(v ?? '')]),
            );
            const ok = validateRequest(authToken, signature, fullUrl, params);
            if (!ok) {
                throw new UnauthorizedException('Invalid twilio signature');
            }
        } else {
            this.logger.warn(
                'Twilio signature/auth token not configured — accepting status callback unverified',
            );
        }

        const event = this.toEvent(body);
        if (!event) {
            this.logger.warn(`Unhandled Twilio status: ${body.MessageStatus}`);
            return { ok: true };
        }

        try {
            await this.webhookEventService.ingest(event);
        } catch (error) {
            this.logger.error(
                `Failed processing Twilio status: ${error instanceof Error ? error.message : error}`,
            );
        }
        return { ok: true };
    }

    private toEvent(body: TwilioStatusCallback): WebhookEvent | null {
        if (!body.MessageSid) return null;
        const provider_message_id = body.MessageSid;
        switch (body.MessageStatus) {
            case 'delivered':
                return { kind: 'delivered', channel: 'sms', provider_message_id };
            case 'failed':
            case 'undelivered':
                return {
                    kind: 'failed',
                    channel: 'sms',
                    provider_message_id,
                    metadata: {
                        error_code: body.ErrorCode,
                        error_message: body.ErrorMessage,
                    },
                };
            default:
                return null;
        }
    }
}
