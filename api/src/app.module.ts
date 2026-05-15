import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './modules/internal/mail/mail.module';
import { SmsModule } from './modules/internal/sms/sms.module';
import { AiModule } from './modules/internal/ai/ai.module';
import { RedisModule } from './core/databases/redis/redis.module';
import { RedisCacheModule } from './modules/internal/redis-cache/redis-cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from './shared/config/env/env.module';
import { ApifyModule } from './integrations/apify/apify.module';
import { GemiModule } from './integrations/gemi/gemi.module';
import { ElasticsearchModule } from './integrations/elasticsearch/elasticsearch.module';
import { QueuesModule } from './core/queues/queues.module';
import { BullBoardModule } from './core/queues/bull-board.module';
import { FiltersModule } from './modules/filters/filters.module';
import { ScoringInstructionsModule } from './modules/scoring-instructions/scoring-instructions.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SenderProfilesModule } from './modules/sender-profiles/sender-profiles.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MarketingCampaignsModule } from './modules/marketing-campaigns/marketing-campaigns.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    SmsModule,
    AiModule,
    RedisModule,
    RedisCacheModule,
    // GraphQLModule,
    AuthModule,
    ApifyModule,
    GemiModule,
    ElasticsearchModule,
    QueuesModule,
    BullBoardModule,
    FiltersModule,
    ScoringInstructionsModule,
    LeadsModule,
    ContactsModule,
    SenderProfilesModule,
    OutreachModule,
    SearchModule,
    DashboardModule,
    MarketingCampaignsModule,
    WebhooksModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
