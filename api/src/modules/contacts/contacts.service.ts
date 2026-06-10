import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
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
import { resolveContactEnrichmentSources } from '@/modules/leads/utils/enrichment-sources.utils';
import { AddNoteDto } from './dto/add-note.dto';
import { AiDraftMessageDto } from './dto/ai-draft-message.dto';
import { BulkTriggerScoreDto } from './dto/bulk-trigger-score.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { EnrichContactDto } from './dto/enrich-contact.dto';
import { ListContactsDto } from './dto/list-contacts.dto';
import { buildContactProfileFieldWhere } from './utils/contact-profile-field-filter.utils';

export type ContactListFilterParams = Pick<
    ListContactsDto,
    | 'status'
    | 'tags'
    | 'search'
    | 'filter_uuid'
    | 'lead_uuid'
    | 'score_rules'
    | 'source_type'
    | 'profile_field'
    | 'has_profile_field'
>;
import { LogCallDto } from './dto/log-call.dto';
import { LogEmailDto } from './dto/log-email.dto';
import { LogMeetingDto } from './dto/log-meeting.dto';
import { LogSmsDto } from './dto/log-sms.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { CONTACT_PROFILE_UPDATE_KEYS } from './constants/contact-profile.constants';
import { contactProfileFromLead } from './utils/contact-profile.utils';
import { ContactAiService } from './services/contact-ai.service';
import { enqueueContactScoreJob } from './utils/contact-score-queue.utils';

@Injectable()
export class ContactsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly elasticsearchService: ElasticsearchService,
        private readonly contactAiService: ContactAiService,
        @InjectQueue(AI_PROCESS_QUEUE) private readonly aiProcessQueue: Queue,
    ) { }

    async create(user_uuid: string, dto: CreateContactDto) {
        const filter = await this.prisma.filter.findFirst({
            where: { uuid: dto.filter_uuid, user_uuid },
        });
        if (!filter) {
            throw new NotFoundException('Filter not found');
        }

        const lead = await this.prisma.lead.create({
            data: {
                source_type: SourceType.MANUAL,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                company: dto.company,
                website: dto.website,
                google_maps_url: dto.google_maps_url,
                title: dto.title,
                location: dto.location,
                linkedin_url: dto.linkedin_url,
                industry: dto.industry,
                description: dto.description,
            },
        });

        const profile = contactProfileFromLead(lead);

        const contact = await this.prisma.contact.create({
            data: {
                user_uuid,
                lead_uuid: lead.uuid,
                filter_uuid: dto.filter_uuid,
                status: LeadStatus.NEW,
                notes: dto.notes,
                ...profile,
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

    buildWhereInput(user_uuid: string, query: ContactListFilterParams): Prisma.ContactWhereInput {
        const scoreAnd =
            query.score_rules && query.score_rules.length > 0
                ? {
                      AND: query.score_rules.map((rule) => ({
                          contact_scores: {
                              some: {
                                  scoring_instruction_uuid: rule.scoring_instruction_uuid,
                                  score: { gte: rule.min },
                              },
                          },
                      })),
                  }
                : {};

        const profileFieldAnd =
            query.profile_field && query.has_profile_field !== undefined
                ? buildContactProfileFieldWhere(query.profile_field, query.has_profile_field)
                : {};

        return {
            user_uuid,
            ...(query.status && { status: query.status }),
            ...scoreAnd,
            ...profileFieldAnd,
            ...(query.filter_uuid && { filter_uuid: query.filter_uuid }),
            ...(query.lead_uuid && { lead_uuid: query.lead_uuid }),
            ...(query.source_type && { lead: { source_type: query.source_type } }),
            ...(query.tags && query.tags.length > 0
                ? { tags: { some: { tag: { in: query.tags } } } }
                : {}),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { email: { contains: query.search, mode: 'insensitive' } },
                    { company: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
    }

    async findAll(user_uuid: string, query: ListContactsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where = this.buildWhereInput(user_uuid, query);

        const [data, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                include: {
                    tags: true,
                    lead: true,
                    contact_scores: {
                        include: { scoring_instruction: { select: { uuid: true, name: true } } },
                    },
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
                contact_scores: {
                    include: { scoring_instruction: { select: { uuid: true, name: true } } },
                },
                filter: {
                    include: {
                        filter_scoring_instructions: {
                            include: {
                                scoring_instruction: {
                                    select: { uuid: true, name: true, instructions: true },
                                },
                            },
                        },
                    },
                },
                interactions: {
                    orderBy: { created_at: 'desc' },
                    take: 20,
                    include: {
                        outreach_message: {
                            select: {
                                uuid: true,
                                subject: true,
                                channel: true,
                                status: true,
                                sent_at: true,
                            },
                        },
                    },
                },
                outreach_messages: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!contact) {
            throw new NotFoundException(`Contact ${uuid} not found`);
        }
        const { filter: rawFilter, ...rest } = contact;
        const filter = rawFilter
            ? (() => {
                  const { filter_scoring_instructions, ...frest } = rawFilter;
                  return {
                      ...frest,
                      scoring_instructions: filter_scoring_instructions.map(
                          (l) => l.scoring_instruction,
                      ),
                  };
              })()
            : null;
        return {
            ...rest,
            filter,
            tags: contact.tags.map((t) => t.tag),
        };
    }

    async update(user_uuid: string, uuid: string, dto: UpdateContactDto) {
        await this.requireOwnedContact(user_uuid, uuid);
        const data: Prisma.ContactUpdateInput = {};
        if (dto.notes !== undefined) {
            data.notes = dto.notes;
        }
        if (dto.filter_uuid !== undefined) {
            const filter = await this.prisma.filter.findFirst({
                where: { uuid: dto.filter_uuid, user_uuid },
            });
            if (!filter) {
                throw new NotFoundException('Filter not found');
            }
            data.filter = { connect: { uuid: dto.filter_uuid } };
        }
        for (const key of CONTACT_PROFILE_UPDATE_KEYS) {
            if (dto[key] !== undefined) {
                data[key] = dto[key] as never;
            }
        }
        await this.prisma.contact.update({
            where: { uuid },
            data,
        });
        await this.reindexContact(uuid);
        return this.findOne(user_uuid, uuid);
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

        const noteTrimmed = dto.note?.trim();

        const [updated] = await this.prisma.$transaction([
            this.prisma.contact.update({
                where: { uuid },
                data: { status: dto.status },
            }),
            this.prisma.interaction.create({
                data: {
                    contact_uuid: uuid,
                    user_uuid,
                    type: InteractionType.STATUS_CHANGE,
                    content: noteTrimmed ?? null,
                    status_change: {
                        from: existing.status,
                        to: dto.status,
                    },
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

    async logCall(
        user_uuid: string,
        uuid: string,
        dto: LogCallDto,
    ): Promise<Interaction> {
        await this.requireOwnedContact(user_uuid, uuid);
        const metadata: Prisma.InputJsonValue = {
            outcome: dto.outcome,
            direction: dto.direction,
            ...(dto.duration_minutes !== undefined && { duration_minutes: dto.duration_minutes }),
            ...(dto.occurred_at && { occurred_at: dto.occurred_at }),
        };
        return this.prisma.interaction.create({
            data: {
                contact_uuid: uuid,
                user_uuid,
                type: InteractionType.CALL,
                content: dto.content?.trim() || null,
                metadata,
            },
        });
    }

    async logMeeting(
        user_uuid: string,
        uuid: string,
        dto: LogMeetingDto,
    ): Promise<Interaction> {
        await this.requireOwnedContact(user_uuid, uuid);
        const metadata: Prisma.InputJsonValue = {
            occurred_at: dto.occurred_at,
            ...(dto.duration_minutes !== undefined && { duration_minutes: dto.duration_minutes }),
            ...(dto.location?.trim() && { location: dto.location.trim() }),
        };
        return this.prisma.interaction.create({
            data: {
                contact_uuid: uuid,
                user_uuid,
                type: InteractionType.MEETING,
                content: dto.content?.trim() || null,
                metadata,
            },
        });
    }

    async logEmail(
        user_uuid: string,
        uuid: string,
        dto: LogEmailDto,
    ): Promise<Interaction> {
        await this.requireOwnedContact(user_uuid, uuid);
        const metadata: Prisma.InputJsonValue = {
            direction: dto.direction,
            ...(dto.subject?.trim() && { subject: dto.subject.trim() }),
            ...(dto.occurred_at && { occurred_at: dto.occurred_at }),
        };
        return this.prisma.interaction.create({
            data: {
                contact_uuid: uuid,
                user_uuid,
                type: InteractionType.EMAIL,
                content: dto.content?.trim() || null,
                metadata,
            },
        });
    }

    async logSms(
        user_uuid: string,
        uuid: string,
        dto: LogSmsDto,
    ): Promise<Interaction> {
        await this.requireOwnedContact(user_uuid, uuid);
        const metadata: Prisma.InputJsonValue = {
            direction: dto.direction,
            ...(dto.occurred_at && { occurred_at: dto.occurred_at }),
        };
        return this.prisma.interaction.create({
            data: {
                contact_uuid: uuid,
                user_uuid,
                type: InteractionType.SMS,
                content: dto.content?.trim() || null,
                metadata,
            },
        });
    }

    async getInteractions(user_uuid: string, uuid: string) {
        await this.requireOwnedContact(user_uuid, uuid);
        return this.prisma.interaction.findMany({
            where: { contact_uuid: uuid },
            orderBy: { created_at: 'desc' },
            include: {
                outreach_message: {
                    select: {
                        uuid: true,
                        subject: true,
                        channel: true,
                        status: true,
                        sent_at: true,
                    },
                },
            },
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
                    ...contactProfileFromLead(lead),
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

    async triggerScore(
        user_uuid: string,
        uuid: string,
        dto?: { scoring_instruction_uuids?: string[] },
    ): Promise<{ jobId: string }> {
        const row = await this.prisma.contact.findFirst({
            where: { uuid, user_uuid },
            include: {
                filter: {
                    include: {
                        filter_scoring_instructions: { select: { scoring_instruction_uuid: true } },
                    },
                },
            },
        });
        if (!row) {
            throw new NotFoundException(`Contact ${uuid} not found`);
        }
        const allowed =
            row.filter?.filter_scoring_instructions.map((x) => x.scoring_instruction_uuid) ?? [];
        return enqueueContactScoreJob(
            this.aiProcessQueue,
            this.prisma,
            uuid,
            allowed,
            dto?.scoring_instruction_uuids,
        );
    }

    async triggerBulkScore(
        user_uuid: string,
        dto: BulkTriggerScoreDto,
    ): Promise<
        | { jobIds: string[]; queued: number; skipped_contacts: number; is_batch: false }
        | { batch_id: string; queued: number; skipped_contacts: number; is_batch: true }
    > {
        const contactUuids = [...new Set(dto.contact_uuids)];
        const filterUuids = [...new Set(dto.filter_uuids)];
        const ruleUuids = [...new Set(dto.scoring_instruction_uuids)];

        const filters = await this.prisma.filter.findMany({
            where: { user_uuid, uuid: { in: filterUuids } },
            include: {
                filter_scoring_instructions: { select: { scoring_instruction_uuid: true } },
            },
        });
        if (filters.length !== filterUuids.length) {
            const found = new Set(filters.map((f) => f.uuid));
            const missing = filterUuids.filter((u) => !found.has(u));
            throw new NotFoundException(`Filter(s) not found: ${missing.join(', ')}`);
        }

        const rulesAllowedByFilters = new Set<string>();
        for (const f of filters) {
            for (const link of f.filter_scoring_instructions) {
                rulesAllowedByFilters.add(link.scoring_instruction_uuid);
            }
        }
        for (const id of ruleUuids) {
            if (!rulesAllowedByFilters.has(id)) {
                throw new BadRequestException(
                    `Scoring instruction ${id} is not attached to any of the selected filters.`,
                );
            }
        }

        const contacts = await this.prisma.contact.findMany({
            where: { user_uuid, uuid: { in: contactUuids } },
            include: {
                filter: {
                    include: {
                        filter_scoring_instructions: { select: { scoring_instruction_uuid: true } },
                    },
                },
            },
        });
        if (contacts.length !== contactUuids.length) {
            const found = new Set(contacts.map((c) => c.uuid));
            const missing = contactUuids.filter((u) => !found.has(u));
            throw new NotFoundException(`Contact(s) not found: ${missing.join(', ')}`);
        }

        const jobIds: string[] = [];
        const batchPlan: Array<{ contact_uuid: string; instruction_uuids: string[] }> = [];
        let skipped_contacts = 0;

        for (const c of contacts) {
            const allowed =
                c.filter?.filter_scoring_instructions.map((x) => x.scoring_instruction_uuid) ?? [];
            const perContactRequested = ruleUuids.filter((id) => allowed.includes(id));
            if (perContactRequested.length === 0) {
                skipped_contacts += 1;
                continue;
            }

            if (dto.use_batch) {
                batchPlan.push({ contact_uuid: c.uuid, instruction_uuids: perContactRequested });
            } else {
                const job = await enqueueContactScoreJob(
                    this.aiProcessQueue,
                    this.prisma,
                    c.uuid,
                    allowed,
                    perContactRequested,
                );
                jobIds.push(job.jobId);
            }
        }

        if (dto.use_batch) {
            if (batchPlan.length === 0) {
                throw new BadRequestException(
                    'None of the selected contacts use any of the chosen scoring rules on their filter.',
                );
            }
            const { batch_id, queued } = await this.contactAiService.submitBatchScore(user_uuid, batchPlan);
            return { batch_id, queued, skipped_contacts, is_batch: true as const };
        }

        if (jobIds.length === 0) {
            throw new BadRequestException(
                'None of the selected contacts use any of the chosen scoring rules on their filter.',
            );
        }

        return { jobIds, queued: jobIds.length, skipped_contacts, is_batch: false as const };
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

    async draftAdHocMessage(
        user_uuid: string,
        dto: AiDraftMessageDto,
    ): Promise<{ subject: string | null; content: string }> {
        return this.contactAiService.draftAdHocMessage(user_uuid, dto);
    }

    async enrichContact(
        user_uuid: string,
        uuid: string,
        dto: EnrichContactDto,
    ): Promise<{ jobId: string }> {
        await this.requireOwnedContact(user_uuid, uuid);
        const row = await this.prisma.contact.findFirst({
            where: { uuid, user_uuid },
            include: { filter: true },
        });
        if (!row) {
            throw new NotFoundException(`Contact ${uuid} not found`);
        }
        const enrichment_sources = resolveContactEnrichmentSources(dto.sources, row.filter);
        const job = await this.aiProcessQueue.add(
            `contact-enrich:${uuid}`,
            {
                contact_uuid: uuid,
                action: 'enrich' as const,
                enrichment_sources,
                force_enrichment: true,
            },
            { removeOnComplete: 100, removeOnFail: 100 },
        );
        return { jobId: String(job.id) };
    }

    async getUserTags(user_uuid: string): Promise<string[]> {
        const rows = await this.prisma.contactTag.findMany({
            where: { contact: { user_uuid } },
            distinct: ['tag'],
            select: { tag: true },
            orderBy: { tag: 'asc' },
        });
        return rows.map((r) => r.tag);
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
            include: {
                lead: true,
                tags: true,
                contact_scores: {
                    include: { scoring_instruction: { select: { uuid: true, name: true } } },
                },
            },
        });
        if (fresh) {
            await this.elasticsearchService.indexContact(fresh);
        }
    }
}
