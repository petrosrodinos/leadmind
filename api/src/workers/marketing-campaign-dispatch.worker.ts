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
import {
    assignEmailProviders,
    parseStoredEmailProviderAllocations,
} from '@/modules/outreach/utils/email-provider-allocation.util';
import { MessageSendJobData } from './marketing-message-send.worker';
import { EmailProviderTarget } from '@/modules/integrations/interfaces/email-credentials.interface';

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

        if (campaign.status === CampaignStatus.SCHEDULED) {
            await this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: { status: CampaignStatus.SENDING, started_at: new Date() },
            });
        }

        const filters = (campaign.filters_snapshot ?? {}) as unknown as CampaignFiltersDto;
        const channels = campaign.channels as Channel[];
        const contact_uuids = await this.resolver.resolveContactUuids(
            campaign.user_uuid,
            filters,
            { channels },
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

        const mccs = await this.prisma.marketingCampaignContact.findMany({
            where: { campaign_uuid },
            select: { uuid: true, contact_uuid: true, channel: true },
        });

        await this.prisma.marketingCampaign.update({
            where: { uuid: campaign_uuid },
            data: {
                selected_contact_count: contact_uuids.length,
                total_messages: mccs.length,
                queued_count: mccs.length,
            },
        });

        const emailMccs = mccs.filter((mcc) => mcc.channel === Channel.EMAIL);
        const allocations = parseStoredEmailProviderAllocations(
            campaign.email_provider_allocations,
        );
        const providerAssignments =
            allocations && emailMccs.length > 0
                ? assignEmailProviders(
                      emailMccs.map((mcc) => mcc.contact_uuid),
                      allocations,
                  )
                : new Map<string, EmailProviderTarget>();

        for (let i = 0; i < mccs.length; i += CHUNK_SIZE) {
            const chunk = mccs.slice(i, i + CHUNK_SIZE);
            await this.messageSendQueue.addBulk(
                chunk.map((mcc) => {
                    const assignment =
                        mcc.channel === Channel.EMAIL
                            ? providerAssignments.get(mcc.contact_uuid)
                            : undefined;
                    const data: MessageSendJobData = {
                        campaign_uuid,
                        mcc_uuid: mcc.uuid,
                        ...(assignment
                            ? {
                                  email_provider: assignment.provider,
                                  email_account: assignment.account,
                              }
                            : {}),
                    };
                    return {
                        name: `send-${mcc.uuid}`,
                        data,
                        opts: {
                            jobId: `mcc-${mcc.uuid}`,
                            attempts: 5,
                            backoff: { type: 'exponential', delay: 60_000 },
                            removeOnComplete: 1000,
                            removeOnFail: 1000,
                        },
                    };
                }),
            );
        }

        this.logger.log(`Campaign ${campaign_uuid}: enqueued ${mccs.length} send jobs`);

        await this.sendService.checkCompletion(campaign_uuid);
    }
}
