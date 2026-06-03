import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { MarketingCampaignsModule } from '@/modules/marketing-campaigns/marketing-campaigns.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { LeadsModule } from '@/modules/leads/leads.module';
import { ResendWebhookController } from './resend-webhook.controller';
import { TwilioWebhookController } from './twilio-webhook.controller';
import { UnsubscribeController } from './unsubscribe.controller';
import { OpenAiWebhookController } from './openai-webhook.controller';
import { UtmAnalyticsWebhookController } from './utm-analytics-webhook.controller';
import { WebhookEventService } from './services/webhook-event.service';
import { CampaignUtmAnalyticsService } from './services/campaign-utm-analytics.service';

import { OpenAiBatchDispatchService } from './services/openai-batch-dispatch.service';

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        ResendModule,
        AiIntegrationModule,
        MarketingCampaignsModule,
        ContactsModule,
        LeadsModule,
    ],
    controllers: [
        ResendWebhookController,
        TwilioWebhookController,
        UnsubscribeController,
        OpenAiWebhookController,
        UtmAnalyticsWebhookController,
    ],
    providers: [WebhookEventService, CampaignUtmAnalyticsService, OpenAiBatchDispatchService],
    exports: [WebhookEventService, CampaignUtmAnalyticsService, OpenAiBatchDispatchService],
})
export class WebhooksModule { }
