import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Channel } from '@/generated/prisma';
import { MARKETING_MESSAGE_SEND_QUEUE } from '@/core/queues/queues.constants';
import { CampaignMessageSendService } from '@/modules/marketing-campaigns/services/campaign-message-send.service';
import { EmailProviderTarget } from '@/modules/integrations/interfaces/email-credentials.interface';

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
        try {
            const providerOverride =
                job.data.email_provider && job.data.email_account
                    ? {
                          provider: job.data.email_provider,
                          account: job.data.email_account,
                      }
                    : undefined;
            const result = await this.sendService.sendByMcc(job.data.mcc_uuid, providerOverride);
            if (result.status === 'failed') {
                throw new Error(result.reason ?? 'send failed');
            }
        } catch (error) {
            this.logger.error(
                `Send job for MCC ${job.data.mcc_uuid} threw: ${error instanceof Error ? error.message : error}`,
            );
            throw error;
        }
    }
}
