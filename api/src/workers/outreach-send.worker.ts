import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Channel, InteractionType, MsgStatus } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { MessageSendService } from '@/modules/outreach/services/message-send.service';

interface OutreachSendJobData {
    message_uuid: string;
}

@Processor(OUTREACH_SEND_QUEUE, { concurrency: 10 })
export class OutreachSendWorker extends WorkerHost {
    private readonly logger = new Logger(OutreachSendWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly messageSendService: MessageSendService,
    ) {
        super();
    }

    async process(job: Job<OutreachSendJobData>): Promise<void> {
        const message = await this.prisma.outreachMessage.findUnique({
            where: { uuid: job.data.message_uuid },
            include: { contact: true },
        });
        if (!message) {
            this.logger.warn(`Outreach message ${job.data.message_uuid} not found`);
            return;
        }
        if (message.status !== MsgStatus.PENDING) {
            this.logger.warn(`Outreach message ${message.uuid} is ${message.status}, skipping`);
            return;
        }
        if (message.campaign_uuid) {
            this.logger.warn(
                `Outreach message ${message.uuid} is part of campaign ${message.campaign_uuid}; expected the campaign worker to handle it`,
            );
            return;
        }

        try {
            const { provider_message_id } = await this.messageSendService.deliverOutreachMessage(message);

            await this.prisma.$transaction([
                this.messageSendService.messageSentOperation(message.uuid, provider_message_id),
                this.messageSendService.interactionCreateOperation({
                    contact_uuid: message.contact_uuid,
                    user_uuid: message.user_uuid,
                    type: this.toInteractionType(message.channel),
                    outreach_message_uuid: message.uuid,
                }),
                this.messageSendService.contactInteractedOperation(message.contact_uuid),
            ]);
        } catch (error) {
            const error_message = error instanceof Error ? error.message : 'Unknown error';
            await this.messageSendService.messageFailedOperation(message.uuid, error_message);
            this.logger.error(`Failed sending outreach message ${message.uuid}: ${error_message}`);
        }
    }

    private toInteractionType(channel: Channel): InteractionType {
        if (channel === Channel.SMS) {
            return InteractionType.CALL;
        }
        return InteractionType.EMAIL;
    }
}
