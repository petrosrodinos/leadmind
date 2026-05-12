import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Channel, InteractionType, MsgStatus } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OUTREACH_SEND_QUEUE } from '@/core/queues/queues.constants';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { TwillioSmsService } from '@/integrations/notifications/twillio/services/sms.service';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';
import { OutreachRenderService } from '@/modules/outreach/services/outreach-render.service';

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
        private readonly outreachRenderService: OutreachRenderService,
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
        if (message.status !== MsgStatus.PENDING) {
            this.logger.warn(`Outreach message ${message.uuid} is ${message.status}, skipping`);
            return;
        }

        try {
            const rendered = await this.outreachRenderService.renderForUser(message.user_uuid, {
                subject: message.subject,
                content: message.content,
            });

            if (message.channel === Channel.EMAIL) {
                if (!message.contact.email) {
                    throw new Error('Contact has no email');
                }
                await this.resendMailService.sendEmail({
                    to: message.contact.email,
                    subject: rendered.subject ?? 'Outreach message',
                    html: sanitizeEmailHtml(rendered.content),
                });
            } else if (message.channel === Channel.SMS) {
                if (!message.contact.phone) {
                    throw new Error('Contact has no phone');
                }
                await this.twillioSmsService.sendSms({
                    to: message.contact.phone,
                    body: rendered.content,
                });
            } else {
                await this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: MsgStatus.FAILED,
                        metadata: { reason: 'LinkedIn DM not yet implemented' },
                    },
                });
                return;
            }

            await this.prisma.$transaction([
                this.prisma.outreachMessage.update({
                    where: { uuid: message.uuid },
                    data: {
                        status: MsgStatus.SENT,
                        sent_at: new Date(),
                        metadata: null,
                    },
                }),
                this.prisma.interaction.create({
                    data: {
                        contact_uuid: message.contact_uuid,
                        user_uuid: message.user_uuid,
                        type: this.toInteractionType(message.channel),
                        outreach_message_uuid: message.uuid,
                    },
                }),
            ]);
        } catch (error) {
            const error_message = error instanceof Error ? error.message : 'Unknown error';
            await this.prisma.outreachMessage.update({
                where: { uuid: message.uuid },
                data: {
                    status: MsgStatus.FAILED,
                    metadata: { error: error_message },
                },
            });
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
