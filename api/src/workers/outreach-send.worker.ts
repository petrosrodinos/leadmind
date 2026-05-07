import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';

interface OutreachSendJobData {
    message_uuid: string;
}

@Processor(OUTREACH_SEND_QUEUE, { concurrency: 10 })
export class OutreachSendWorker extends WorkerHost {
    private readonly logger = new Logger(OutreachSendWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resendMailService: ResendMailService,
        private readonly twillioSmsService: TwillioSmsService,
    ) {
        super();
    }

    async process(job: Job<OutreachSendJobData>): Promise<void> {
        const message = await this.prisma.outreachMessage.findUnique({
            where: { uuid: job.data.message_uuid },
            include: { contact: { include: { lead: true } } },
        });
        if (!message) {
            this.logger.warn(`Outreach message ${job.data.message_uuid} not found`);
            return;
        }
        if (message.status !== 'PENDING') {
            this.logger.warn(`Outreach message ${message.uuid} is ${message.status}, skipping`);
            return;
        }

        try {
            if (message.channel === 'EMAIL') {
                if (!message.contact.lead.email) {
                    throw new Error('Lead has no email');
                }
                await this.resendMailService.sendEmail({
                    to: message.contact.lead.email,
                    subject: message.subject ?? 'Outreach message',
                    html: message.content,
                });
            } else if (message.channel === 'SMS') {
                if (!message.contact.lead.phone) {
                    throw new Error('Lead has no phone');
                }
                await this.twillioSmsService.sendSms({
                    to: message.contact.lead.phone,
                    body: message.content,
                });
            } else {
                await this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: 'FAILED',
                        metadata: { reason: 'LinkedIn DM not yet implemented' },
                    },
                });
                return;
            }

            await this.prisma.$transaction([
                this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: 'SENT',
                        sent_at: new Date(),
                        metadata: null,
                    },
                }),
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: message.contact_uuid,
                        user_uuid: message.user_uuid,
                        type: this.toInteractionType(message.channel),
                        content: message.content,
                        metadata: { outreach_message_uuid: message.uuid, channel: message.channel },
                    },
                }),
            ]);
        } catch (error) {
            const error_message = error instanceof Error ? error.message : 'Unknown error';
            await this.prisma.outreachMessage.update({
                where: { uuid: message.uuid },
                data: {
                    status: 'FAILED',
                    metadata: { error: error_message },
                },
            });
            this.logger.error(`Failed sending outreach message ${message.uuid}: ${error_message}`);
        }
    }

    private toInteractionType(channel: 'EMAIL' | 'SMS' | 'LINKEDIN'): 'EMAIL' | 'CALL' {
        if (channel === 'SMS') {
            return 'CALL';
        }
        return 'EMAIL';
    }
}
