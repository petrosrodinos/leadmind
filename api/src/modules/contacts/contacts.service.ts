import { InjectQueue } from '@nestjs/bullmq';
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import {
    Contact,
    Interaction,
    InteractionType,
    LeadStatus,
    OutreachMessage,
    Prisma,
    SourceType,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { AI_PROCESS_QUEUE } from '@/core/queues/queues.constants';
import { AddNoteDto } from './dto/add-note.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactsDto } from './dto/list-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';

@Injectable()
export class ContactsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly elasticsearchService: ElasticsearchService,
        @InjectQueue(AI_PROCESS_QUEUE) private readonly aiProcessQueue: Queue,
    ) { }

    async create(user_uuid: string, dto: CreateContactDto) {
        const lead = await this.prisma.lead.create({
            data: {
                source_type: SourceType.MANUAL,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                company: dto.company,
                website: dto.website,
                title: dto.title,
                location: dto.location,
            },
        });

        const contact = await this.prisma.contact.create({
            data: {
                user_uuid,
                lead_uuid: lead.uuid,
                status: LeadStatus.NEW,
                notes: dto.notes,
                ...(dto.tags && dto.tags.length > 0
                    ? {
                        tags: {
                            create: dto.tags.map((tag) => ({ tag })),
                        },
                    }
                    : {}),
            },
        });

        if (dto.notes) {
            await this.prisma.interaction.create({
                data: {
                    contact_uuid: contact.uuid,
                    user_uuid,
                    type: InteractionType.NOTE,
                    content: dto.notes,
                },
            });
        }

        await this.elasticsearchService.indexLead(lead);
        await this.reindexContact(contact.uuid);

        return this.findOne(user_uuid, contact.uuid);
    }

    async findAll(user_uuid: string, query: ListContactsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where: Prisma.ContactWhereInput = {
            user_uuid,
            ...(query.status && { status: query.status }),
            ...(query.min_score != null && { score: { gte: query.min_score } }),
            ...(query.tags && query.tags.length > 0
                ? { tags: { some: { tag: { in: query.tags } } } }
                : {}),
            ...(query.search && {
                lead: {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { company: { contains: query.search, mode: 'insensitive' } },
                    ],
                },
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                include: {
                    tags: true,
                    lead: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.contact.count({ where }),
        ]);

        return {
            data: data.map((c) => ({
                ...c,
                tags: c.tags.map((t) => t.tag),
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(user_uuid: string, uuid: string) {
        const contact = await this.prisma.contact.findFirst({
            where: { uuid, user_uuid },
            include: {
                tags: true,
                lead: true,
                interactions: {
                    orderBy: { created_at: 'desc' },
                    take: 20,
                },
                outreach_messages: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!contact) {
            throw new NotFoundException(`Contact ${uuid} not found`);
        }
        return {
            ...contact,
            tags: contact.tags.map((t) => t.tag),
        };
    }

    async update(user_uuid: string, uuid: string, dto: UpdateContactDto): Promise<Contact> {
        await this.requireOwnedContact(user_uuid, uuid);
        return this.prisma.contact.update({
            where: { uuid },
            data: { notes: dto.notes },
        });
    }

    async remove(user_uuid: string, uuid: string): Promise<{ uuid: string }> {
        await this.requireOwnedContact(user_uuid, uuid);
        await this.prisma.contact.delete({ where: { uuid } });
        await this.elasticsearchService.deleteContact(uuid);
        return { uuid };
    }

    async updateStatus(
        user_uuid: string,
        uuid: string,
        dto: UpdateStatusDto,
    ): Promise<Contact> {
        const existing = await this.requireOwnedContact(user_uuid, uuid);

        if (existing.status === dto.status) {
            return existing;
        }

        const [updated] = await this.prisma.$transaction([
            this.prisma.contact.update({
                where: { uuid },
                data: { status: dto.status },
            }),
            this.prisma.interaction.create({
                data: {
                    contact_uuid: uuid,
                    user_uuid,
                    type: InteractionType.NOTE,
                    content: `Status changed from ${existing.status} to ${dto.status}`,
                },
            }),
        ]);

        await this.reindexContact(uuid);

        return updated;
    }

    async updateTags(
        user_uuid: string,
        uuid: string,
        dto: UpdateTagsDto,
    ): Promise<{ tags: string[] }> {
        await this.requireOwnedContact(user_uuid, uuid);

        const unique = Array.from(new Set(dto.tags));

        await this.prisma.$transaction([
            this.prisma.contactTag.deleteMany({ where: { contact_uuid: uuid } }),
            ...(unique.length > 0
                ? [
                    this.prisma.contactTag.createMany({
                        data: unique.map((tag) => ({ contact_uuid: uuid, tag })),
                    }),
                ]
                : []),
        ]);

        await this.reindexContact(uuid);

        return { tags: unique };
    }

    async addNote(
        user_uuid: string,
        uuid: string,
        dto: AddNoteDto,
    ): Promise<Interaction> {
        await this.requireOwnedContact(user_uuid, uuid);
        return this.prisma.interaction.create({
            data: {
                contact_uuid: uuid,
                user_uuid,
                type: InteractionType.NOTE,
                content: dto.content,
            },
        });
    }

    async getInteractions(user_uuid: string, uuid: string): Promise<Interaction[]> {
        await this.requireOwnedContact(user_uuid, uuid);
        return this.prisma.interaction.findMany({
            where: { contact_uuid: uuid },
            orderBy: { created_at: 'desc' },
        });
    }

    async convertFromLead(user_uuid: string, lead_uuid: string) {
        const lead = await this.prisma.lead.findUnique({ where: { uuid: lead_uuid } });
        if (!lead) {
            throw new NotFoundException(`Lead ${lead_uuid} not found`);
        }

        const existing = await this.prisma.contact.findFirst({
            where: { user_uuid, lead_uuid },
        });
        if (existing) {
            throw new ConflictException(`Contact for lead ${lead_uuid} already exists`);
        }

        try {
            const contact = await this.prisma.contact.create({
                data: {
                    user_uuid,
                    lead_uuid,
                    status: LeadStatus.NEW,
                },
            });
            await this.reindexContact(contact.uuid);
            return this.findOne(user_uuid, contact.uuid);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException(`Contact for lead ${lead_uuid} already exists`);
            }
            throw error;
        }
    }

    async triggerScore(user_uuid: string, uuid: string): Promise<{ jobId: string }> {
        await this.requireOwnedContact(user_uuid, uuid);
        const job = await this.aiProcessQueue.add(
            `contact-score:${uuid}`,
            { contact_uuid: uuid, action: 'score' as const },
            { removeOnComplete: 100, removeOnFail: 100 },
        );
        return { jobId: String(job.id) };
    }

    async triggerDraftMessages(
        user_uuid: string,
        uuid: string,
    ): Promise<{ jobId: string }> {
        await this.requireOwnedContact(user_uuid, uuid);
        const job = await this.aiProcessQueue.add(
            `contact-draft:${uuid}`,
            { contact_uuid: uuid, action: 'draft' as const },
            { removeOnComplete: 100, removeOnFail: 100 },
        );
        return { jobId: String(job.id) };
    }

    async listMessages(user_uuid: string, uuid: string): Promise<OutreachMessage[]> {
        await this.requireOwnedContact(user_uuid, uuid);
        return this.prisma.outreachMessage.findMany({
            where: { contact_uuid: uuid },
            orderBy: { created_at: 'desc' },
        });
    }

    private async requireOwnedContact(user_uuid: string, uuid: string): Promise<Contact> {
        const contact = await this.prisma.contact.findFirst({
            where: { uuid, user_uuid },
        });
        if (!contact) {
            throw new NotFoundException(`Contact ${uuid} not found`);
        }
        return contact;
    }

    private async reindexContact(uuid: string): Promise<void> {
        const fresh = await this.prisma.contact.findUnique({
            where: { uuid },
            include: { lead: true, tags: true },
        });
        if (fresh) {
            await this.elasticsearchService.indexContact(fresh);
        }
    }
}
