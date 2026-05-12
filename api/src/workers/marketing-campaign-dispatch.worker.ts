import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import {
    CampaignContactStatus,
    CampaignStatus,
    Channel,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    MARKETING_CAMPAIGN_DISPATCH_QUEUE,
    MARKETING_MESSAGE_SEND_QUEUE,
} from '@/core/queues/queues.constants';
import { CampaignContactResolverService } from '@/modules/marketing-campaigns/services/campaign-contact-resolver.service';
import { CampaignFiltersDto } from '@/modules/marketing-campaigns/dto/campaign-filters.dto';
import { CampaignMessageSendService } from '@/modules/marketing-campaigns/services/campaign-message-send.service';

interface DispatchJobData {
    campaign_uuid: string;
}

const CHUNK_SIZE = 500;

@Processor(MARKETING_CAMPAIGN_DISPATCH_QUEUE, { concurrency: 2 })
export class MarketingCampaignDispatchWorker extends WorkerHost {
    private readonly logger = new Logger(MarketingCampaignDispatchWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resolver: CampaignContactResolverService,
        private readonly sendService: CampaignMessageSendService,
        @InjectQueue(MARKETING_MESSAGE_SEND_QUEUE)
        private readonly messageSendQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<DispatchJobData>): Promise<void> {
        const { campaign_uuid } = job.data;
        const campaign = await this.prisma.marketingCampaign.findUnique({
            where: { uuid: campaign_uuid },
        });
        if (!campaign) {
            this.logger.warn(`Campaign ${campaign_uuid} not found`);
            return;
        }
        if (
            campaign.status !== CampaignStatus.SENDING &&
            campaign.status !== CampaignStatus.SCHEDULED
        ) {
            this.logger.warn(`Campaign ${campaign_uuid} is ${campaign.status}, skipping dispatch`);
            return;
        }

        // If we're firing from a delayed scheduled job, promote SCHEDULED → SENDING + set started_at.
        if (campaign.status === CampaignStatus.SCHEDULED) {
            await this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: { status: CampaignStatus.SENDING, started_at: new Date() },
            });
        }

        const filters = (campaign.filters_snapshot ?? {}) as unknown as CampaignFiltersDto;
        const contact_uuids = await this.resolver.resolveContactUuids(
            campaign.user_uuid,
            filters,
        );

        if (contact_uuids.length === 0) {
            await this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: {
                    selected_contact_count: 0,
                    total_messages: 0,
                    status: CampaignStatus.COMPLETED,
                    completed_at: new Date(),
                },
            });
            this.logger.log(`Campaign ${campaign_uuid} dispatched zero contacts; marked COMPLETED`);
            return;
        }

        const channels = campaign.channels as Channel[];
        const mccRows = contact_uuids.flatMap((contact_uuid) =>
            channels.map((channel) => ({
                campaign_uuid,
                contact_uuid,
                channel,
                status: CampaignContactStatus.QUEUED,
            })),
        );

        const created = await this.prisma.marketingCampaignContact.createMany({
            data: mccRows,
            skipDuplicates: true,
        });
        this.logger.log(
            `Campaign ${campaign_uuid}: ${created.count} MCC rows created (${contact_uuids.length} contacts × ${channels.length} channels)`,
        );

        // Look up the MCC uuids for this campaign so we can stable-id BullMQ jobs by mcc_uuid
        const mccs = await this.prisma.marketingCampaignContact.findMany({
            where: { campaign_uuid },
            select: { uuid: true },
        });

        await this.prisma.marketingCampaign.update({
            where: { uuid: campaign_uuid },
            data: {
                selected_contact_count: contact_uuids.length,
                total_messages: mccs.length,
                queued_count: mccs.length,
            },
        });

        // Enqueue all send jobs in chunks
        for (let i = 0; i < mccs.length; i += CHUNK_SIZE) {
            const chunk = mccs.slice(i, i + CHUNK_SIZE);
            await this.messageSendQueue.addBulk(
                chunk.map((mcc) => ({
                    name: `send-${mcc.uuid}`,
                    data: { campaign_uuid, mcc_uuid: mcc.uuid },
                    opts: {
                        jobId: `mcc-${mcc.uuid}`,
                        attempts: 5,
                        backoff: { type: 'exponential', delay: 60_000 },
                        removeOnComplete: 1000,
                        removeOnFail: 1000,
                    },
                })),
            );
        }

        this.logger.log(`Campaign ${campaign_uuid}: enqueued ${mccs.length} send jobs`);

        // Check completion immediately in case all rows were already terminal (e.g. retry)
        await this.sendService.checkCompletion(campaign_uuid);
    }
}
