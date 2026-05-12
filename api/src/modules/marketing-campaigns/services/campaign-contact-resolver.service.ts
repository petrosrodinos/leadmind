import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { CampaignFiltersDto } from '../dto/campaign-filters.dto';

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
        const base = this.contactsService.buildWhereInput(user_uuid, filters);

        const extras: Prisma.ContactWhereInput = {};
        const and: Prisma.ContactWhereInput[] = [];

        if (filters.has_email) {
            and.push({ email: { not: null } });
        }
        if (filters.has_phone) {
            and.push({ phone: { not: null } });
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

    async resolveContactUuids(user_uuid: string, filters: CampaignFiltersDto): Promise<string[]> {
        const where = this.buildWhereInput(user_uuid, filters);
        const rows = await this.prisma.contact.findMany({
            where,
            select: { uuid: true },
        });
        return rows.map((r) => r.uuid);
    }
}
