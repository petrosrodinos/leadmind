import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { ContactAiService } from './services/contact-ai.service';

@Module({
    imports: [PrismaModule, AiIntegrationModule],
    providers: [ContactAiService],
    exports: [ContactAiService],
})
export class ContactsModule { }
