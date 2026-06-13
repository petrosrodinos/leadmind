import { Injectable, NotFoundException } from '@nestjs/common';
import {
    CampaignContactStatus,
    Channel,
    InteractionType,
    LeadStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { emptyLeadStatusCounts } from '@/modules/contacts/constants/lead-status.constants';
import { ContactProfileField } from '@/modules/contacts/constants/contact-profile-fields.constants';
import { buildContactProfileFieldWhere } from '@/modules/contacts/utils/contact-profile-field-filter.utils';
import { CallOutcome } from '@/modules/contacts/dto/log-call.dto';
import { MeetingOutcome } from '@/modules/contacts/dto/log-meeting.dto';
import { ContactAudienceStatsQueryDto } from './dto/contact-audience-stats-query.dto';
import type { ContactAudienceStats } from './interfaces/contact-audience-stats.interface';

function roundRate(numerator: number, denominator: number): number | null {
    if (denominator <= 0) return null;
    return Number(((numerator / denominator) * 100).toFixed(1));
}

function emptyMeetingOutcomes(): Record<MeetingOutcome, number> {
    return Object.fromEntries(
        Object.values(MeetingOutcome).map((o) => [o, 0]),
    ) as Record<MeetingOutcome, number>;
}

function emptyCallOutcomes(): Record<CallOutcome, number> {
    return Object.fromEntries(
        Object.values(CallOutcome).map((o) => [o, 0]),
    ) as Record<CallOutcome, number>;
}

const SENT_CAMPAIGN_STATUSES: CampaignContactStatus[] = [
    CampaignContactStatus.SENT,
    CampaignContactStatus.DELIVERED,
    CampaignContactStatus.OPENED,
    CampaignContactStatus.CLICKED,
    CampaignContactStatus.REPLIED,
    CampaignContactStatus.BOUNCED,
    CampaignContactStatus.UNSUBSCRIBED,
];

@Injectable()
export class ContactAudienceStatsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
    ) {}

    async getFilterStats(
        user_uuid: string,
        filterUuid: string,
        query: ContactAudienceStatsQueryDto,
    ): Promise<ContactAudienceStats> {
        const filter = await this.prisma.filter.findFirst({
            where: { uuid: filterUuid, user_uuid },
            select: { uuid: true },
        });
        if (!filter) throw new NotFoundException('Filter not found');
        return this.aggregateStats(user_uuid, { type: 'filter', uuid: filterUuid }, query);
    }

    async getListStats(
        user_uuid: string,
        listUuid: string,
        query: ContactAudienceStatsQueryDto,
    ): Promise<ContactAudienceStats> {
        const list = await this.prisma.contactList.findFirst({
            where: { uuid: listUuid, user_uuid },
            select: { uuid: true },
        });
        if (!list) throw new NotFoundException('Contact list not found');
        return this.aggregateStats(user_uuid, { type: 'list', uuid: listUuid }, query);
    }

    private async buildContactWhere(
        user_uuid: string,
        scope: { type: 'filter' | 'list'; uuid: string },
        query: ContactAudienceStatsQueryDto,
    ): Promise<Prisma.ContactWhereInput> {
        const where = this.contactsService.buildWhereInput(user_uuid, {
            status: query.status,
            tags: query.tags,
            search: query.search,
            filter_uuid: scope.type === 'filter' ? scope.uuid : query.filter_uuid,
            lead_uuid: query.lead_uuid,
            score_rules: query.score_rules,
            profile_field: query.profile_field,
            has_profile_field: query.has_profile_field,
        });

        const scopeAnd: Prisma.ContactWhereInput[] = [];
        if (scope.type === 'list') {
            scopeAnd.push({ list_memberships: { some: { list_uuid: scope.uuid } } });
        }

        if (query.has_email) {
            scopeAnd.push(buildContactProfileFieldWhere(ContactProfileField.EMAIL, true));
        }
        if (query.has_phone) {
            scopeAnd.push(buildContactProfileFieldWhere(ContactProfileField.PHONE, true));
        }

        this.contactsService.applyAudienceFilters(where, {
            last_interaction_after: query.last_interaction_after,
            last_interaction_before: query.last_interaction_before,
            never_contacted: query.never_contacted,
            include_unsubscribed: query.include_unsubscribed,
        });

        if (scopeAnd.length > 0) {
            const existingAnd = where.AND
                ? Array.isArray(where.AND)
                    ? where.AND
                    : [where.AND]
                : [];
            where.AND = [...existingAnd, ...scopeAnd];
        }

        return where;
    }

    private buildInteractionDateFilter(
        query: ContactAudienceStatsQueryDto,
    ): Prisma.DateTimeFilter | undefined {
        if (!query.from && !query.to) return undefined;
        return {
            ...(query.from && { gte: new Date(query.from) }),
            ...(query.to && { lte: new Date(query.to) }),
        };
    }

    private async aggregateStats(
        user_uuid: string,
        scope: { type: 'filter' | 'list'; uuid: string },
        query: ContactAudienceStatsQueryDto,
    ): Promise<ContactAudienceStats> {
        const contactWhere = await this.buildContactWhere(user_uuid, scope, query);
        const interactionDate = this.buildInteractionDateFilter(query);
        const interactionWhere: Prisma.InteractionWhereInput = {
            contact: contactWhere,
            ...(interactionDate && { created_at: interactionDate }),
        };

        const [
            statusGroups,
            totalContacts,
            withEmail,
            withPhone,
            neverContacted,
            meetingTotal,
            meetingContacts,
            callTotal,
            meetingOutcomeCounts,
            callOutcomeCounts,
            notes,
            statusChanges,
            totalInteractions,
            emailsOpened,
            linksClicked,
            repliesReceived,
            websiteVisits,
            bookingVisits,
        ] = await Promise.all([
            this.prisma.contact.groupBy({
                by: ['status'],
                where: contactWhere,
                _count: { _all: true },
            }),
            this.prisma.contact.count({ where: contactWhere }),
            this.prisma.contact.count({
                where: {
                    AND: [
                        contactWhere,
                        buildContactProfileFieldWhere(ContactProfileField.EMAIL, true),
                    ],
                },
            }),
            this.prisma.contact.count({
                where: {
                    AND: [
                        contactWhere,
                        buildContactProfileFieldWhere(ContactProfileField.PHONE, true),
                    ],
                },
            }),
            this.prisma.contact.count({
                where: {
                    AND: [
                        contactWhere,
                        {
                            campaign_contacts: {
                                none: {
                                    channel: { in: [Channel.EMAIL, Channel.SMS, Channel.LINKEDIN] },
                                    status: { in: SENT_CAMPAIGN_STATUSES },
                                },
                            },
                        },
                    ],
                },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.MEETING },
            }),
            this.prisma.interaction.groupBy({
                by: ['contact_uuid'],
                where: { ...interactionWhere, type: InteractionType.MEETING },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.CALL },
            }),
            this.countOutcomes(InteractionType.MEETING, interactionWhere, Object.values(MeetingOutcome)),
            this.countOutcomes(InteractionType.CALL, interactionWhere, Object.values(CallOutcome)),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.NOTE },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.STATUS_CHANGE },
            }),
            this.prisma.interaction.count({ where: interactionWhere }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.EMAIL_OPENED },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.LINK_CLICKED },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.REPLY_RECEIVED },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.WEBSITE_VISIT },
            }),
            this.prisma.interaction.count({
                where: { ...interactionWhere, type: InteractionType.BOOKING_VISIT },
            }),
        ]);

        const by_status = emptyLeadStatusCounts();
        for (const row of statusGroups) {
            by_status[row.status] = row._count._all;
        }

        const considered =
            by_status[LeadStatus.NEW] +
            by_status[LeadStatus.CONTACTED] +
            by_status[LeadStatus.QUALIFIED] +
            by_status[LeadStatus.NURTURING] +
            by_status[LeadStatus.CONVERTED];
        const closed = by_status[LeadStatus.CONVERTED] + by_status[LeadStatus.LOST];

        const byMeetingOutcome = emptyMeetingOutcomes();
        for (const [outcome, count] of Object.entries(meetingOutcomeCounts)) {
            if (outcome in byMeetingOutcome) {
                byMeetingOutcome[outcome as MeetingOutcome] = count;
            }
        }

        const byCallOutcome = emptyCallOutcomes();
        for (const [outcome, count] of Object.entries(callOutcomeCounts)) {
            if (outcome in byCallOutcome) {
                byCallOutcome[outcome as CallOutcome] = count;
            }
        }

        const meetingCloseDenom =
            byMeetingOutcome[MeetingOutcome.COMPLETED] +
            byMeetingOutcome[MeetingOutcome.CLOSED_WON] +
            byMeetingOutcome[MeetingOutcome.CLOSED_LOST];

        return {
            pipeline: {
                total_contacts: totalContacts,
                by_status,
                conversion_rate:
                    considered > 0
                        ? roundRate(by_status[LeadStatus.CONVERTED], considered) ?? 0
                        : 0,
                close_rate:
                    closed > 0
                        ? roundRate(by_status[LeadStatus.CONVERTED], closed) ?? 0
                        : 0,
                loss_rate:
                    closed > 0
                        ? roundRate(by_status[LeadStatus.LOST], closed) ?? 0
                        : 0,
                active_pipeline:
                    by_status[LeadStatus.NEW] +
                    by_status[LeadStatus.CONTACTED] +
                    by_status[LeadStatus.QUALIFIED] +
                    by_status[LeadStatus.NURTURING],
            },
            meetings: {
                total: meetingTotal,
                by_outcome: byMeetingOutcome,
                contacts_with_meetings: meetingContacts.length,
                no_show_rate: roundRate(byMeetingOutcome[MeetingOutcome.NO_SHOW], meetingTotal),
                meeting_close_rate: roundRate(
                    byMeetingOutcome[MeetingOutcome.CLOSED_WON],
                    meetingCloseDenom,
                ),
            },
            calls: {
                total: callTotal,
                by_outcome: byCallOutcome,
                connect_rate: roundRate(byCallOutcome[CallOutcome.CONNECTED], callTotal),
            },
            engagement: {
                with_email: withEmail,
                with_phone: withPhone,
                never_contacted: neverContacted,
                emails_opened: emailsOpened,
                links_clicked: linksClicked,
                replies_received: repliesReceived,
                website_visits: websiteVisits,
                booking_visits: bookingVisits,
            },
            activity: {
                total_interactions: totalInteractions,
                notes,
                status_changes: statusChanges,
            },
        };
    }

    private async countOutcomes(
        type: InteractionType,
        interactionWhere: Prisma.InteractionWhereInput,
        outcomes: string[],
    ): Promise<Record<string, number>> {
        const counts = await Promise.all(
            outcomes.map((outcome) =>
                this.prisma.interaction.count({
                    where: {
                        ...interactionWhere,
                        type,
                        metadata: { path: ['outcome'], equals: outcome },
                    },
                }),
            ),
        );
        return Object.fromEntries(outcomes.map((outcome, i) => [outcome, counts[i]]));
    }
}
