import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactAiService } from './services/contact-ai.service';

@Module({
    imports: [
        PrismaModule,
        AiIntegrationModule,
        BullModule.registerQueue({ name: AI_PROCESS_QUEUE }),
    ],
    controllers: [ContactsController],
    providers: [ContactsService, ContactAiService],
    exports: [ContactsService, ContactAiService],
})
export class ContactsModule { }
