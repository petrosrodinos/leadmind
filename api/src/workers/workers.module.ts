import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ApifyModule } from '@/integrations/apify/apify.module';
import { GemiModule } from '@/integrations/gemi/gemi.module';
import { LeadsModule } from '@/modules/leads/leads.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { OutreachModule } from '@/modules/outreach/outreach.module';
import { MarketingCampaignsModule } from '@/modules/marketing-campaigns/marketing-campaigns.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { TwillioModule } from '@/integrations/notifications/twillio/twillio.module';
import {
    AI_PROCESS_QUEUE,
    FILTER_SCRAPE_QUEUE,
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
    OUTREACH_SEND_QUEUE,
} from '@/core/queues/queues.constants';
import { FilterScrapeWorker } from './filter-scrape.worker';
import { AiProcessWorker } from './ai-process.worker';
import { OutreachSendWorker } from './outreach-send.worker';
import { MarketingCampaignDispatchWorker } from './marketing-campaign-dispatch.worker';
import { MarketingMessageSendWorker } from './marketing-message-send.worker';

@Module({
    imports: [
        PrismaModule,
        ApifyModule,
        GemiModule,
        LeadsModule,
        ContactsModule,
        OutreachModule,
        MarketingCampaignsModule,
        ResendModule,
        TwillioModule,
        BullModule.registerQueue(
            { name: FILTER_SCRAPE_QUEUE },
            { name: AI_PROCESS_QUEUE },
            { name: OUTREACH_SEND_QUEUE },
            { name: MARKETING_CAMPAIGN_DISPATCH_QUEUE },
            { name: MARKETING_MESSAGE_SEND_QUEUE },
        ),
    ],
    providers: [
        FilterScrapeWorker,
        AiProcessWorker,
        OutreachSendWorker,
        MarketingCampaignDispatchWorker,
        MarketingMessageSendWorker,
    ],
    exports: [
        FilterScrapeWorker,
        AiProcessWorker,
        OutreachSendWorker,
        MarketingCampaignDispatchWorker,
        MarketingMessageSendWorker,
    ],
})
export class WorkersModule { }
