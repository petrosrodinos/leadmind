import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import {
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
} from '@/core/queues/queues.constants';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { OutreachModule } from '@/modules/outreach/outreach.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { MarketingCampaignsController } from './marketing-campaigns.controller';
import { MarketingCampaignsService } from './services/marketing-campaigns.service';
import { CampaignContactResolverService } from './services/campaign-contact-resolver.service';
import { CampaignMessageSendService } from './services/campaign-message-send.service';
import { CampaignAiService } from './services/campaign-ai.service';

@Module({
    imports: [
        PrismaModule,
        ContactsModule,
        OutreachModule,
        IntegrationsModule,
        AiIntegrationModule,
        BullModule.registerQueue({ name: MARKETING_CAMPAIGN_DISPATCH_QUEUE }),
        BullModule.registerQueue({ name: MARKETING_MESSAGE_SEND_QUEUE }),
    ],
    controllers: [MarketingCampaignsController],
    providers: [
        MarketingCampaignsService,
        CampaignContactResolverService,
        CampaignMessageSendService,
        CampaignAiService,
    ],
    exports: [
        MarketingCampaignsService,
        CampaignContactResolverService,
        CampaignMessageSendService,
    ],
})
export class MarketingCampaignsModule { }
