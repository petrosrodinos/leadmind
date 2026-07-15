import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Channel, ExternalIntegrationProvider } from '@/generated/prisma';
import { MARKETING_MESSAGE_SEND_QUEUE } from '@/core/queues/queues.constants';
import { CampaignMessageSendService } from '@/modules/marketing-campaigns/services/campaign-message-send.service';
import { EmailProviderTarget } from '@/modules/integrations/interfaces/email-credentials.interface';
import { logSmtp } from '@/integrations/notifications/smtp/smtp-flow-log.util';

export interface MessageSendJobData {
    campaign_uuid: string;
    mcc_uuid: string;
    email_provider?: EmailProviderTarget['provider'];
    email_account?: string;
}

@Processor(MARKETING_MESSAGE_SEND_QUEUE, {
    concurrency: 10,
    limiter: { max: 50, duration: 1000 },
})
export class MarketingMessageSendWorker extends WorkerHost {
    private readonly logger = new Logger(MarketingMessageSendWorker.name);

    constructor(private readonly sendService: CampaignMessageSendService) {
        super();
    }

    async process(job: Job<MessageSendJobData>): Promise<void> {
        const isSmtp = job.data.email_provider === ExternalIntegrationProvider.SMTP;
        if (isSmtp) {
            logSmtp(this.logger, 'log', {
                step: 'campaign-worker-start',
                jobId: job.id,
                mcc: job.data.mcc_uuid,
                campaign: job.data.campaign_uuid,
                account: job.data.email_account ?? 'default',
            });
        }
        this.logger.log(
            `Campaign send job started jobId=${job.id} mcc=${job.data.mcc_uuid} campaign=${job.data.campaign_uuid} provider=${job.data.email_provider ?? 'default'} account=${job.data.email_account ?? 'default'}`,
        );
        try {
            const providerOverride =
                job.data.email_provider && job.data.email_account
                    ? {
                          provider: job.data.email_provider,
                          account: job.data.email_account,
                      }
                    : undefined;
            const result = await this.sendService.sendByMcc(job.data.mcc_uuid, providerOverride);
            this.logger.log(
                `Campaign send job finished mcc=${job.data.mcc_uuid} status=${result.status}${result.reason ? ` reason=${result.reason}` : ''}`,
            );
            if (isSmtp) {
                logSmtp(this.logger, result.status === 'sent' ? 'log' : 'warn', {
                    step: 'campaign-worker-done',
                    jobId: job.id,
                    mcc: job.data.mcc_uuid,
                    status: result.status,
                    reason: result.reason,
                });
            }
            if (result.status === 'failed') {
                throw new Error(result.reason ?? 'send failed');
            }
        } catch (error) {
            if (isSmtp) {
                logSmtp(this.logger, 'error', {
                    step: 'campaign-worker-failed',
                    jobId: job.id,
                    mcc: job.data.mcc_uuid,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            this.logger.error(
                `Send job for MCC ${job.data.mcc_uuid} threw: ${error instanceof Error ? error.message : error}`,
                error instanceof Error ? error.stack : undefined,
            );
            throw error;
        }
    }
}
