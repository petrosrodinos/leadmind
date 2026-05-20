import { Injectable, Logger } from '@nestjs/common';
import { InteractionType, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import {
    parseUtmParams,
    utmParamsFromRecord,
    utmParamsMatch,
    type UtmParams,
} from '@/shared/utils/utm-params.util';
import type { UtmAnalyticsDestination } from '../dto/utm-analytics-webhook.dto';

export interface UtmAnalyticsPayload {
    campaign_uuid?: string;
    destination: UtmAnalyticsDestination;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    contact_uuid?: string;
    url?: string;
}

export interface UtmAnalyticsResult {
    ok: true;
    matched: boolean;
    campaign_uuid?: string;
}

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class CampaignUtmAnalyticsService {
    private readonly logger = new Logger(CampaignUtmAnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async ingest(payload: UtmAnalyticsPayload): Promise<UtmAnalyticsResult> {
        const incoming = this.incomingUtmParams(payload);
        const campaign_uuid = await this.resolveCampaignUuid(payload, incoming);

        if (!campaign_uuid) {
            this.logger.warn(
                `UTM analytics — no campaign match for destination=${payload.destination} utm=${JSON.stringify(incoming)}`,
            );
            return { ok: true, matched: false };
        }

        const now = new Date();
        const counterField =
            payload.destination === 'website' ? 'website_visit_count' : 'booking_visit_count';
        const interactionType =
            payload.destination === 'website'
                ? InteractionType.WEBSITE_VISIT
                : InteractionType.BOOKING_VISIT;

        const ops: Prisma.PrismaPromise<unknown>[] = [
            this.prisma.marketingCampaign.update({
                where: { uuid: campaign_uuid },
                data: { [counterField]: { increment: 1 } },
            }),
        ];

        if (payload.contact_uuid) {
            const contact = await this.prisma.contact.findUnique({
                where: { uuid: payload.contact_uuid },
                select: { uuid: true, user_uuid: true },
            });
            if (contact) {
                ops.push(
                    this.prisma.interaction.create({
                        data: {
                            contact_uuid: contact.uuid,
                            user_uuid: contact.user_uuid,
                            campaign_uuid,
                            type: interactionType,
                            metadata: {
                                destination: payload.destination,
                                url: payload.url,
                                utm: incoming,
                            } as Prisma.InputJsonValue,
                        },
                    }),
                    this.prisma.contact.update({
                        where: { uuid: contact.uuid },
                        data: { last_interaction_at: now },
                    }),
                );
            }
        }

        await this.prisma.$transaction(ops);
        this.logger.log(
            `UTM analytics recorded for campaign ${campaign_uuid} (${payload.destination})`,
        );

        return { ok: true, matched: true, campaign_uuid };
    }

    private incomingUtmParams(payload: UtmAnalyticsPayload): UtmParams {
        return utmParamsFromRecord(payload as unknown as Record<string, unknown>);
    }

    private async resolveCampaignUuid(
        payload: UtmAnalyticsPayload,
        incoming: UtmParams,
    ): Promise<string | null> {
        if (payload.campaign_uuid) {
            const direct = await this.prisma.marketingCampaign.findUnique({
                where: { uuid: payload.campaign_uuid },
                select: { uuid: true },
            });
            return direct?.uuid ?? null;
        }

        const campaignToken = incoming.campaign?.trim();
        if (campaignToken && UUID_PATTERN.test(campaignToken)) {
            const byUtmCampaign = await this.prisma.marketingCampaign.findUnique({
                where: { uuid: campaignToken },
                select: { uuid: true },
            });
            if (byUtmCampaign) {
                return byUtmCampaign.uuid;
            }
        }

        if (!Object.values(incoming).some(Boolean)) {
            return null;
        }

        const utmJsonField =
            payload.destination === 'website' ? 'website_utm' : 'booking_utm';

        const campaigns = await this.prisma.marketingCampaign.findMany({
            where: { sender_profile_uuid: { not: null } },
            include: { sender_profile: true },
            orderBy: [{ started_at: 'desc' }, { created_at: 'desc' }],
            take: 100,
        });

        for (const campaign of campaigns) {
            const profile = campaign.sender_profile;
            if (!profile) {
                continue;
            }
            const stored = parseUtmParams(profile[utmJsonField]);
            if (stored && utmParamsMatch(stored, incoming)) {
                return campaign.uuid;
            }
        }

        return null;
    }
}
