import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
import { AiUsageModule } from '@/modules/ai-usage/ai-usage.module';
import { AiService } from './services/ai.service';
import { AiConfig } from './utils/ai.config';
import { OpenAiBatchService } from './services/openai-batch.service';
import { AiCredentialsService } from './services/ai-credentials.service';

@Module({
    imports: [ConfigModule, PrismaModule, IntegrationsModule, AiUsageModule],
    providers: [AiService, AiConfig, OpenAiBatchService, AiCredentialsService],
    exports: [AiService, AiConfig, OpenAiBatchService, AiCredentialsService],
})
export class AiIntegrationModule { }
