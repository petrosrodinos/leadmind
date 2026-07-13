import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { MessageTemplatesController } from './message-templates.controller';
import { MessageTemplatesService } from './message-templates.service';
import { TemplateAiService } from './services/template-ai.service';

@Module({
    imports: [PrismaModule, AiIntegrationModule],
    controllers: [MessageTemplatesController],
    providers: [MessageTemplatesService, TemplateAiService],
    exports: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
