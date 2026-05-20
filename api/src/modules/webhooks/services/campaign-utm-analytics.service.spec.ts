import { InteractionType } from '@/generated/prisma';
import { CampaignUtmAnalyticsService } from './campaign-utm-analytics.service';

describe('CampaignUtmAnalyticsService', () => {
    const campaignUuid = '11111111-1111-4111-8111-111111111111';

    function createService(options?: {
        campaign?: { uuid: string; sender_profile?: { website_utm: object; booking_utm: object } } | null;
        campaigns?: Array<{
            uuid: string;
            sender_profile: { website_utm: object | null; booking_utm: object | null };
        }>;
    }) {
        const prisma = {
            marketingCampaign: {
                findUnique: jest.fn().mockResolvedValue(options?.campaign ?? null),
                findMany: jest.fn().mockResolvedValue(options?.campaigns ?? []),
                update: jest.fn().mockResolvedValue({}),
            },
            contact: {
                findUnique: jest.fn().mockResolvedValue(null),
            },
            interaction: {
                create: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest.fn(async (ops: unknown[]) => {
                for (const op of ops) {
                    await op;
                }
            }),
        };

        return {
            service: new CampaignUtmAnalyticsService(prisma as any),
            prisma,
        };
    }

    it('increments website_visit_count when campaign_uuid is provided', async () => {
        const { service, prisma } = createService({
            campaign: { uuid: campaignUuid, sender_profile: { website_utm: {}, booking_utm: {} } },
        });

        const result = await service.ingest({
            campaign_uuid: campaignUuid,
            destination: 'website',
            utm_source: 'email',
        });

        expect(result.matched).toBe(true);
        expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { uuid: campaignUuid },
                data: { website_visit_count: { increment: 1 } },
            }),
        );
    });

    it('matches campaign by sender profile utm config', async () => {
        const { service, prisma } = createService({
            campaigns: [
                {
                    uuid: campaignUuid,
                    sender_profile: {
                        website_utm: { source: 'email', campaign: 'spring' },
                        booking_utm: null,
                    },
                },
            ],
        });

        const result = await service.ingest({
            destination: 'website',
            utm_source: 'email',
            utm_campaign: 'spring',
        });

        expect(result.matched).toBe(true);
        expect(result.campaign_uuid).toBe(campaignUuid);
        expect(prisma.marketingCampaign.update).toHaveBeenCalled();
    });

    it('increments booking_visit_count for booking destination', async () => {
        const { service, prisma } = createService({
            campaign: { uuid: campaignUuid, sender_profile: { website_utm: {}, booking_utm: {} } },
        });

        await service.ingest({
            campaign_uuid: campaignUuid,
            destination: 'booking',
            utm_medium: 'outreach',
        });

        expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { booking_visit_count: { increment: 1 } },
            }),
        );
    });

    it('creates interaction when contact_uuid is provided', async () => {
        const contactUuid = '22222222-2222-4222-8222-222222222222';
        const prisma = {
            marketingCampaign: {
                findUnique: jest.fn().mockResolvedValue({ uuid: campaignUuid }),
                findMany: jest.fn().mockResolvedValue([]),
                update: jest.fn().mockResolvedValue({}),
            },
            contact: {
                findUnique: jest.fn().mockResolvedValue({
                    uuid: contactUuid,
                    user_uuid: 'user-1',
                }),
                update: jest.fn().mockResolvedValue({}),
            },
            interaction: {
                create: jest.fn().mockResolvedValue({}),
            },
            $transaction: jest.fn(async (ops: unknown[]) => {
                for (const op of ops) {
                    await op;
                }
            }),
        };

        const service = new CampaignUtmAnalyticsService(prisma as any);

        await service.ingest({
            campaign_uuid: campaignUuid,
            destination: 'website',
            contact_uuid: contactUuid,
            utm_source: 'email',
        });

        expect(prisma.interaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    type: InteractionType.WEBSITE_VISIT,
                    contact_uuid: contactUuid,
                    campaign_uuid: campaignUuid,
                }),
            }),
        );
    });
});
