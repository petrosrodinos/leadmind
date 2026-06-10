import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReminderStatus } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { NotificationsGateway } from '@/gateways/notifications.gateway';
import { REMINDER_TRIGGER_QUEUE } from '@/core/queues/queues.constants';

interface ReminderTriggerJobData {
    reminder_uuid: string;
}

@Processor(REMINDER_TRIGGER_QUEUE)
export class ReminderTriggerWorker extends WorkerHost {
    private readonly logger = new Logger(ReminderTriggerWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: NotificationsGateway,
    ) {
        super();
    }

    async process(job: Job<ReminderTriggerJobData>): Promise<void> {
        const reminder = await this.prisma.reminder.findUnique({
            where: { uuid: job.data.reminder_uuid },
            include: {
                contact: {
                    select: {
                        uuid: true,
                        name: true,
                        company: true,
                        email: true,
                    },
                },
            },
        });

        if (!reminder) {
            this.logger.warn(`Reminder ${job.data.reminder_uuid} not found — skipping`);
            return;
        }

        if (reminder.status !== ReminderStatus.PENDING) {
            this.logger.warn(`Reminder ${reminder.uuid} is ${reminder.status} — skipping`);
            return;
        }

        this.gateway.emitToUser(reminder.user_uuid, 'reminder.triggered', reminder);
        this.logger.log(`Reminder triggered: ${reminder.uuid} for user ${reminder.user_uuid}`);
    }
}
