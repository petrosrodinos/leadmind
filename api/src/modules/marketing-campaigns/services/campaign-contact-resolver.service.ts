import { Injectable } from '@nestjs/common';
import { CampaignContactStatus, Channel, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { buildContactProfileFieldWhere } from '@/modules/contacts/utils/contact-profile-field-filter.utils';
import { CampaignProfileField } from '../constants/campaign-profile-fields.constants';
import { CampaignFiltersDto } from '../dto/campaign-filters.dto';

export type CampaignAudienceMode = 'preview' | 'send';

export interface BuildCampaignAudienceOptions {
    mode?: CampaignAudienceMode;
    channels?: Channel[];
}

@Injectable()
export class CampaignContactResolverService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
    ) { }

    buildWhereInput(
        user_uuid: string,
        filters: CampaignFiltersDto,
        options: BuildCampaignAudienceOptions = {},
    ): Prisma.ContactWhereInput {
        const mode = options.mode ?? 'send';
        const channels = options.channels ?? [];

        const base = this.contactsService.buildWhereInput(user_uuid, {
            status: filters.status,
            tags: filters.tags,
            search: filters.search,
            filter_uuid: filters.filter_uuid,
            lead_uuid: filters.lead_uuid,
            score_rules: filters.score_rules,
            profile_field: filters.profile_field,
            has_profile_field: filters.has_profile_field,
        });

        const and: Prisma.ContactWhereInput[] = [];

        if (mode === 'send') {
            if (channels.includes(Channel.EMAIL) || filters.has_email) {
                and.push(buildContactProfileFieldWhere(CampaignProfileField.EMAIL, true));
            }
            if (channels.includes(Channel.SMS) || filters.has_phone) {
                and.push(buildContactProfileFieldWhere(CampaignProfileField.PHONE, true));
            }
        }

        if (filters.last_interaction_after) {
            and.push({ last_interaction_at: { gte: new Date(filters.last_interaction_after) } });
        }
        if (filters.last_interaction_before) {
            and.push({ last_interaction_at: { lte: new Date(filters.last_interaction_before) } });
        }
        if (filters.exclude_uuids && filters.exclude_uuids.length > 0) {
            and.push({ uuid: { notIn: filters.exclude_uuids } });
        }
        if (mode === 'send' && !filters.include_unsubscribed) {
            and.push({ unsubscribed_at: null });
        }
        if (filters.never_contacted) {
            and.push({
                campaign_contacts: {
                    none: {
                        channel: { in: [Channel.EMAIL, Channel.SMS, Channel.LINKEDIN] },
                        status: {
                            in: [
                                CampaignContactStatus.SENT,
                                CampaignContactStatus.DELIVERED,
                                CampaignContactStatus.OPENED,
                                CampaignContactStatus.CLICKED,
                                CampaignContactStatus.REPLIED,
                                CampaignContactStatus.BOUNCED,
                                CampaignContactStatus.UNSUBSCRIBED,
                            ],
                        },
                    },
                },
            });
        }

        return this.mergeWhereClauses(base, and);
    }

    async previewContacts(
        user_uuid: string,
        filters: CampaignFiltersDto,
        limit = 50,
    ): Promise<{ total: number; sample: any[]; with_email: number; with_phone: number }> {
        const where = this.buildWhereInput(user_uuid, filters, { mode: 'preview' });
        const emailWhere = this.mergeWhereClauses(where, [
            buildContactProfileFieldWhere(CampaignProfileField.EMAIL, true),
        ]);
        const phoneWhere = this.mergeWhereClauses(where, [
            buildContactProfileFieldWhere(CampaignProfileField.PHONE, true),
        ]);

        const [total, sample, with_email, with_phone] = await Promise.all([
            this.prisma.contact.count({ where }),
            this.prisma.contact.findMany({
                where,
                include: { tags: true },
                orderBy: { created_at: 'desc' },
                take: limit,
            }),
            this.prisma.contact.count({ where: emailWhere }),
            this.prisma.contact.count({ where: phoneWhere }),
        ]);
        return {
            total,
            sample: sample.map((c) => ({ ...c, tags: c.tags.map((t) => t.tag) })),
            with_email,
            with_phone,
        };
    }

    async resolveContactUuids(
        user_uuid: string,
        filters: CampaignFiltersDto,
        options?: { limit?: number; channels?: Channel[] },
    ): Promise<string[]> {
        const where = this.buildWhereInput(user_uuid, filters, {
            mode: 'send',
            channels: options?.channels,
        });
        const rows = await this.prisma.contact.findMany({
            where,
            select: { uuid: true },
            ...(options?.limit !== undefined && { take: options.limit }),
        });
        return rows.map((r) => r.uuid);
    }

    private mergeWhereClauses(
        base: Prisma.ContactWhereInput,
        andClauses: Prisma.ContactWhereInput[],
    ): Prisma.ContactWhereInput {
        if (andClauses.length === 0) return base;

        const baseAnd = base.AND
            ? Array.isArray(base.AND)
                ? base.AND
                : [base.AND]
            : [];
        const { AND: _and, ...rest } = base;
        return { ...rest, AND: [...baseAnd, ...andClauses] };
    }
}
