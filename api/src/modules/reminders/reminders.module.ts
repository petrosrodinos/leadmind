import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { GatewaysModule } from '@/gateways/gateways.module';
import { REMINDER_TRIGGER_QUEUE } from '@/core/queues/queues.constants';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
    imports: [
        PrismaModule,
        GatewaysModule,
        BullModule.registerQueue({ name: REMINDER_TRIGGER_QUEUE }),
    ],
    controllers: [RemindersController],
    providers: [RemindersService],
    exports: [RemindersService],
})
export class RemindersModule {}
