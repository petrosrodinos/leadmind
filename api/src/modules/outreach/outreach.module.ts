import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { SmtpModule } from '@/integrations/notifications/smtp/smtp.module';
import { TwillioModule } from '@/integrations/notifications/twillio/twillio.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
import { SenderProfilesModule } from '@/modules/sender-profiles/sender-profiles.module';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';
import { OutreachRenderService } from './services/outreach-render.service';
import { MessageSendService } from './services/message-send.service';

@Module({
    imports: [
        PrismaModule,
        ResendModule,
        SmtpModule,
        TwillioModule,
        IntegrationsModule,
        SenderProfilesModule,
        BullModule.registerQueue({ name: OUTREACH_SEND_QUEUE }),
    ],
    controllers: [OutreachController],
    providers: [OutreachService, OutreachRenderService, MessageSendService],
    exports: [OutreachService, OutreachRenderService, MessageSendService],
})
export class OutreachModule { }
