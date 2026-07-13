import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
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
        PrismaModule,
        IntegrationsModule,
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
