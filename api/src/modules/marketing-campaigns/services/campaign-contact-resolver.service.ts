import { Injectable } from '@nestjs/common';
import { CampaignContactStatus, Channel, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { CampaignProfileField } from '../constants/campaign-profile-fields.constants';
import { CampaignFiltersDto } from '../dto/campaign-filters.dto';

type ContactProfileColumn =
    | 'email'
    | 'phone'
    | 'website'
    | 'linkedin_url'
    | 'google_maps_url';

const PROFILE_FIELD_COLUMNS: Record<CampaignProfileField, ContactProfileColumn> = {
    [CampaignProfileField.EMAIL]: 'email',
    [CampaignProfileField.PHONE]: 'phone',
    [CampaignProfileField.WEBSITE]: 'website',
    [CampaignProfileField.LINKEDIN_URL]: 'linkedin_url',
    [CampaignProfileField.GOOGLE_MAPS_URL]: 'google_maps_url',
};

function buildProfileFieldWhere(
    field: CampaignProfileField,
    hasValue: boolean,
): Prisma.ContactWhereInput {
    const column = PROFILE_FIELD_COLUMNS[field];
    if (hasValue) {
        return {
            AND: [{ [column]: { not: null } }, { NOT: { [column]: '' } }],
        };
    }
    return {
        OR: [{ [column]: null }, { [column]: '' }],
    };
}

@Injectable()
export class CampaignContactResolverService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
    ) { }

    /**
     * Translates a frozen filters_snapshot into a Prisma where clause. Reuses the contacts
     * service's filter builder so the campaign audience matches the same UX as the contact list.
     */
    buildWhereInput(user_uuid: string, filters: CampaignFiltersDto): Prisma.ContactWhereInput {
        const base = this.contactsService.buildWhereInput(user_uuid, {
            status: filters.status,
            tags: filters.tags,
            search: filters.search,
            filter_uuid: filters.filter_uuid,
            lead_uuid: filters.lead_uuid,
            score_rules: filters.score_rules,
        });

        const extras: Prisma.ContactWhereInput = {};
        const and: Prisma.ContactWhereInput[] = [];

        if (filters.has_email) {
            and.push(buildProfileFieldWhere(CampaignProfileField.EMAIL, true));
        }
        if (filters.has_phone) {
            and.push(buildProfileFieldWhere(CampaignProfileField.PHONE, true));
        }
        if (filters.profile_field && filters.has_profile_field !== undefined) {
            and.push(buildProfileFieldWhere(filters.profile_field, filters.has_profile_field));
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
        if (!filters.include_unsubscribed) {
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

        if (and.length > 0) {
            extras.AND = and;
        }

        return { ...base, ...extras };
    }

    async previewContacts(
        user_uuid: string,
        filters: CampaignFiltersDto,
        limit = 50,
    ): Promise<{ total: number; sample: any[]; with_email: number; with_phone: number }> {
        const where = this.buildWhereInput(user_uuid, filters);
        const [total, sample, with_email, with_phone] = await Promise.all([
            this.prisma.contact.count({ where }),
            this.prisma.contact.findMany({
                where,
                include: { tags: true },
                orderBy: { created_at: 'desc' },
                take: limit,
            }),
            this.prisma.contact.count({
                where: { ...where, email: { not: null } },
            }),
            this.prisma.contact.count({
                where: { ...where, phone: { not: null } },
            }),
        ]);
        return {
            total,
            sample: sample.map((c) => ({ ...c, tags: c.tags.map((t) => t.tag) })),
            with_email,
            with_phone,
        };
    }

    async resolveContactUuids(user_uuid: string, filters: CampaignFiltersDto, limit?: number): Promise<string[]> {
        const where = this.buildWhereInput(user_uuid, filters);
        const rows = await this.prisma.contact.findMany({
            where,
            select: { uuid: true },
            ...(limit !== undefined && { take: limit }),
        });
        return rows.map((r) => r.uuid);
    }
}
