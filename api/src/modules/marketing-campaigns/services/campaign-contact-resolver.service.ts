import { Injectable } from '@nestjs/common';
import { Channel, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { buildContactProfileFieldWhere } from '@/modules/contacts/utils/contact-profile-field-filter.utils';
import { mergeContactWhereClauses } from '@/modules/contacts/utils/contact-where-merge.utils';
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

        if (filters.exclude_uuids && filters.exclude_uuids.length > 0) {
            and.push({ uuid: { notIn: filters.exclude_uuids } });
        }

        const where = mergeContactWhereClauses(base, and);
        this.contactsService.applyAudienceFilters(where, {
            last_interaction_after: filters.last_interaction_after,
            last_interaction_before: filters.last_interaction_before,
            never_contacted: filters.never_contacted,
            include_unsubscribed:
                mode === 'send' ? (filters.include_unsubscribed ?? false) : true,
        });

        return where;
    }

    async previewContacts(
        user_uuid: string,
        filters: CampaignFiltersDto,
        limit = 50,
    ): Promise<{ total: number; sample: any[]; with_email: number; with_phone: number }> {
        const where = this.buildWhereInput(user_uuid, filters, { mode: 'preview' });
        const emailWhere = mergeContactWhereClauses(where, [
            buildContactProfileFieldWhere(CampaignProfileField.EMAIL, true),
        ]);
        const phoneWhere = mergeContactWhereClauses(where, [
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
}
