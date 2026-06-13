import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ContactsService } from '@/modules/contacts/contacts.service';
import { CampaignContactResolverService } from '@/modules/marketing-campaigns/services/campaign-contact-resolver.service';
import { CampaignFiltersDto } from '@/modules/marketing-campaigns/dto/campaign-filters.dto';
import { CreateContactListDto } from './dto/create-contact-list.dto';
import { UpdateContactListDto } from './dto/update-contact-list.dto';
import { ListContactListsDto } from './dto/list-contact-lists.dto';
import { AddListContactsDto } from './dto/add-list-contacts.dto';
import { BulkAddListContactsDto } from './dto/bulk-add-list-contacts.dto';
import { ListContactListMembersDto } from './dto/list-contact-list-members.dto';

@Injectable()
export class ContactListsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly contactsService: ContactsService,
        private readonly campaignContactResolver: CampaignContactResolverService,
    ) {}

    async create(user_uuid: string, dto: CreateContactListDto) {
        return this.prisma.contactList.create({
            data: {
                user_uuid,
                title: dto.title.trim(),
                description: dto.description?.trim() || null,
            },
            include: {
                _count: { select: { members: true } },
            },
        });
    }

    async findAll(user_uuid: string, query: ListContactListsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.ContactListWhereInput = { user_uuid };

        if (query.search?.trim()) {
            const search = query.search.trim();
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.contactList.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updated_at: 'desc' },
                include: {
                    _count: { select: { members: true } },
                },
            }),
            this.prisma.contactList.count({ where }),
        ]);

        return {
            data: data.map((list) => ({
                ...list,
                contact_count: list._count.members,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(user_uuid: string, uuid: string) {
        const list = await this.prisma.contactList.findFirst({
            where: { uuid, user_uuid },
            include: {
                _count: { select: { members: true } },
            },
        });

        if (!list) throw new NotFoundException('Contact list not found');

        return {
            ...list,
            contact_count: list._count.members,
        };
    }

    async update(user_uuid: string, uuid: string, dto: UpdateContactListDto) {
        await this.ensureListOwned(user_uuid, uuid);

        return this.prisma.contactList.update({
            where: { uuid },
            data: {
                ...(dto.title !== undefined && { title: dto.title.trim() }),
                ...(dto.description !== undefined && {
                    description: dto.description?.trim() || null,
                }),
            },
            include: {
                _count: { select: { members: true } },
            },
        });
    }

    async remove(user_uuid: string, uuid: string) {
        await this.ensureListOwned(user_uuid, uuid);
        await this.prisma.contactList.delete({ where: { uuid } });
        return { uuid };
    }

    async findMembers(user_uuid: string, listUuid: string, query: ListContactListMembersDto) {
        await this.ensureListOwned(user_uuid, listUuid);

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const contactWhere = this.contactsService.buildWhereInput(user_uuid, query);

        const where: Prisma.ContactListMemberWhereInput = {
            list_uuid: listUuid,
            contact: contactWhere,
        };

        const [members, total] = await Promise.all([
            this.prisma.contactListMember.findMany({
                where,
                include: {
                    contact: {
                        include: {
                            tags: true,
                            lead: true,
                            contact_scores: {
                                include: {
                                    scoring_instruction: { select: { uuid: true, name: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.contactListMember.count({ where }),
        ]);

        return {
            data: members.map((m) => ({
                ...m.contact,
                tags: m.contact.tags.map((t) => t.tag),
                member_uuid: m.uuid,
                added_at: m.created_at,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async addContacts(user_uuid: string, listUuid: string, dto: AddListContactsDto) {
        await this.ensureListOwned(user_uuid, listUuid);

        const ownedContacts = await this.prisma.contact.findMany({
            where: {
                user_uuid,
                uuid: { in: dto.contact_uuids },
            },
            select: { uuid: true },
        });

        if (ownedContacts.length !== dto.contact_uuids.length) {
            throw new BadRequestException('One or more contacts were not found');
        }

        const result = await this.prisma.contactListMember.createMany({
            data: dto.contact_uuids.map((contact_uuid) => ({
                list_uuid: listUuid,
                contact_uuid,
            })),
            skipDuplicates: true,
        });

        await this.prisma.contactList.update({
            where: { uuid: listUuid },
            data: { updated_at: new Date() },
        });

        return { added: result.count };
    }

    async bulkAddContacts(user_uuid: string, listUuid: string, dto: BulkAddListContactsDto) {
        await this.ensureListOwned(user_uuid, listUuid);

        const existingMemberUuids = await this.getMemberContactUuids(listUuid);
        const filters: CampaignFiltersDto = {
            ...dto.filters,
            exclude_uuids: [
                ...new Set([
                    ...(dto.filters.exclude_uuids ?? []),
                    ...existingMemberUuids,
                ]),
            ],
        };

        const where = this.campaignContactResolver.buildWhereInput(user_uuid, filters, {
            mode: 'preview',
        });
        const matching = await this.prisma.contact.findMany({
            where,
            select: { uuid: true },
        });

        if (matching.length === 0) {
            return { added: 0 };
        }

        const result = await this.prisma.contactListMember.createMany({
            data: matching.map((c) => ({
                list_uuid: listUuid,
                contact_uuid: c.uuid,
            })),
            skipDuplicates: true,
        });

        await this.prisma.contactList.update({
            where: { uuid: listUuid },
            data: { updated_at: new Date() },
        });

        return { added: result.count };
    }

    async removeContact(user_uuid: string, listUuid: string, contactUuid: string) {
        await this.ensureListOwned(user_uuid, listUuid);

        const member = await this.prisma.contactListMember.findFirst({
            where: { list_uuid: listUuid, contact_uuid: contactUuid },
        });

        if (!member) throw new NotFoundException('Contact is not in this list');

        await this.prisma.contactListMember.delete({ where: { uuid: member.uuid } });

        await this.prisma.contactList.update({
            where: { uuid: listUuid },
            data: { updated_at: new Date() },
        });

        return { contact_uuid: contactUuid };
    }

    async getMemberContactUuids(listUuid: string): Promise<string[]> {
        const rows = await this.prisma.contactListMember.findMany({
            where: { list_uuid: listUuid },
            select: { contact_uuid: true },
        });
        return rows.map((r) => r.contact_uuid);
    }

    private async ensureListOwned(user_uuid: string, uuid: string) {
        const list = await this.prisma.contactList.findFirst({
            where: { uuid, user_uuid },
            select: { uuid: true },
        });
        if (!list) throw new NotFoundException('Contact list not found');
        return list;
    }
}
