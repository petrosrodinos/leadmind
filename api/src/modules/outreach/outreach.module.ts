import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { TwillioModule } from '@/integrations/notifications/twillio/twillio.module';
import { SenderProfilesModule } from '@/modules/sender-profiles/sender-profiles.module';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';
import { OutreachRenderService } from './services/outreach-render.service';

@Module({
    imports: [
        PrismaModule,
        ResendModule,
        TwillioModule,
        SenderProfilesModule,
        BullModule.registerQueue({ name: OUTREACH_SEND_QUEUE }),
    ],
    controllers: [OutreachController],
    providers: [OutreachService, OutreachRenderService],
    exports: [OutreachService, OutreachRenderService],
})
export class OutreachModule { }
