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
import { ElasticsearchModule } from './integrations/elasticsearch/elasticsearch.module';
import { QueuesModule } from './core/queues/queues.module';
import { BullBoardModule } from './core/queues/bull-board.module';
import { FiltersModule } from './modules/filters/filters.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SenderProfilesModule } from './modules/sender-profiles/sender-profiles.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
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
    ElasticsearchModule,
    QueuesModule,
    BullBoardModule,
    FiltersModule,
    LeadsModule,
    ContactsModule,
    SenderProfilesModule,
    OutreachModule,
    SearchModule,
    DashboardModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
