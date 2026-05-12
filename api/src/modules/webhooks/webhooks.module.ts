import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { MarketingCampaignsModule } from '@/modules/marketing-campaigns/marketing-campaigns.module';
import { ResendWebhookController } from './resend-webhook.controller';
import { TwilioWebhookController } from './twilio-webhook.controller';
import { UnsubscribeController } from './unsubscribe.controller';
import { WebhookEventService } from './services/webhook-event.service';

@Module({
    imports: [ConfigModule, PrismaModule, MarketingCampaignsModule],
    controllers: [
        ResendWebhookController,
        TwilioWebhookController,
        UnsubscribeController,
    ],
    providers: [WebhookEventService],
    exports: [WebhookEventService],
})
export class WebhooksModule { }
