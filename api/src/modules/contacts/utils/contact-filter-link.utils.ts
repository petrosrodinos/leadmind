import { Contact, Filter, InteractionType, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import { normalizeWebsiteHost } from '@/modules/leads/utils/lead-website.utils';
import { pickHigherLeadStatus } from '@/modules/contacts/constants/lead-status.constants';
import { CONTACT_PROFILE_UPDATE_KEYS } from '@/modules/contacts/constants/contact-profile.constants';

type PrismaClient = PrismaService | Prisma.TransactionClient;

export async function findOwnedContactByEmail(
    prisma: PrismaClient,
    user_uuid: string,
    email: string,
): Promise<Contact | null> {
    const trimmed = email.trim();
    if (!trimmed) return null;
    return prisma.contact.findFirst({
        where: {
            user_uuid,
            email: { equals: trimmed, mode: 'insensitive' },
        },
    });
}

export async function findOwnedContactByWebsite(
    prisma: PrismaClient,
    user_uuid: string,
    website: string | null | undefined,
): Promise<Contact | null> {
    const host = normalizeWebsiteHost(website);
    if (!host) return null;

    const candidates = await prisma.contact.findMany({
        where: {
            user_uuid,
            website: { contains: host, mode: 'insensitive' },
        },
        orderBy: { created_at: 'asc' },
        take: 40,
    });

    return (
        candidates.find((row) => normalizeWebsiteHost(row.website) === host) ?? null
    );
}

export async function ensureContactFilterLink(
    prisma: PrismaClient,
    contact_uuid: string,
    filter_uuid: string,
): Promise<void> {
    await prisma.contactFilter.upsert({
        where: {
            contact_uuid_filter_uuid: { contact_uuid, filter_uuid },
        },
        create: { contact_uuid, filter_uuid },
        update: {},
    });
}

export async function linkContactToFilter(
    prisma: PrismaClient,
    contact: Pick<Contact, 'uuid' | 'filter_uuid'>,
    filter_uuid: string,
): Promise<void> {
    await ensureContactFilterLink(prisma, contact.uuid, filter_uuid);
    if (!contact.filter_uuid) {
        await prisma.contact.update({
            where: { uuid: contact.uuid },
            data: { filter_uuid },
        });
    }
}

export type ContactFilterSummary = Pick<Filter, 'uuid' | 'name'>;

export function shapeContactFilterFields(
    contact: Pick<Contact, 'filter_uuid'> & {
        filter: ContactFilterSummary | Filter | null;
        contact_filters: Array<{ filter: ContactFilterSummary }>;
    },
): {
    filter: ContactFilterSummary | Filter | null;
    also_found_by: ContactFilterSummary[];
    filters: ContactFilterSummary[];
} {
    const linked = contact.contact_filters.map((row) => row.filter);
    const primaryUuid = contact.filter_uuid;
    const also_found_by = linked.filter((f) => f.uuid !== primaryUuid);
    const filters = primaryUuid
        ? [
              ...(contact.filter ? [{ uuid: contact.filter.uuid, name: contact.filter.name }] : []),
              ...also_found_by,
          ]
        : linked.map((f) => ({ uuid: f.uuid, name: f.name }));

    return {
        filter: contact.filter,
        also_found_by,
        filters,
    };
}

export async function mergeContactsIntoCanonical(
    prisma: PrismaService,
    elasticsearchService: ElasticsearchService,
    user_uuid: string,
    source_uuid: string,
    target_uuid: string,
): Promise<string> {
    if (source_uuid === target_uuid) return target_uuid;

    const [source, target] = await Promise.all([
        prisma.contact.findFirst({ where: { uuid: source_uuid, user_uuid } }),
        prisma.contact.findFirst({ where: { uuid: target_uuid, user_uuid } }),
    ]);
    if (!source) return target_uuid;
    if (!target) throw new Error('Target contact not found');

    const mergedStatus = pickHigherLeadStatus(source.status, target.status);
    const profilePatch: Prisma.ContactUpdateInput = {};
    for (const key of CONTACT_PROFILE_UPDATE_KEYS) {
        if (key === 'email') continue;
        const targetVal = target[key];
        const sourceVal = source[key];
        if ((targetVal == null || targetVal === '') && sourceVal != null && sourceVal !== '') {
            profilePatch[key] = sourceVal as never;
        }
    }
    if (!target.filter_uuid && source.filter_uuid) {
        profilePatch.filter = { connect: { uuid: source.filter_uuid } };
    }
    if (mergedStatus !== target.status) {
        profilePatch.status = mergedStatus;
    }

    await prisma.$transaction(async (tx) => {
        if (Object.keys(profilePatch).length > 0) {
            await tx.contact.update({
                where: { uuid: target_uuid },
                data: profilePatch,
            });
        }
        if (mergedStatus !== target.status) {
            await tx.interaction.create({
                data: {
                    contact_uuid: target_uuid,
                    user_uuid,
                    type: InteractionType.STATUS_CHANGE,
                    status_change: {
                        from: target.status,
                        to: mergedStatus,
                    },
                },
            });
        }

        const sourceLinks = await tx.contactFilter.findMany({
            where: { contact_uuid: source_uuid },
        });
        for (const link of sourceLinks) {
            await tx.contactFilter.upsert({
                where: {
                    contact_uuid_filter_uuid: {
                        contact_uuid: target_uuid,
                        filter_uuid: link.filter_uuid,
                    },
                },
                create: {
                    contact_uuid: target_uuid,
                    filter_uuid: link.filter_uuid,
                },
                update: {},
            });
        }
        await tx.contactFilter.deleteMany({ where: { contact_uuid: source_uuid } });

        const targetTags = await tx.contactTag.findMany({
            where: { contact_uuid: target_uuid },
            select: { tag: true },
        });
        const targetTagSet = new Set(targetTags.map((t) => t.tag));
        const sourceTags = await tx.contactTag.findMany({
            where: { contact_uuid: source_uuid },
        });
        for (const row of sourceTags) {
            if (targetTagSet.has(row.tag)) {
                await tx.contactTag.delete({
                    where: {
                        contact_uuid_tag: { contact_uuid: source_uuid, tag: row.tag },
                    },
                });
            } else {
                await tx.contactTag.update({
                    where: {
                        contact_uuid_tag: { contact_uuid: source_uuid, tag: row.tag },
                    },
                    data: { contact_uuid: target_uuid },
                });
                targetTagSet.add(row.tag);
            }
        }

        const targetScores = await tx.contactScore.findMany({
            where: { contact_uuid: target_uuid },
            select: { scoring_instruction_uuid: true },
        });
        const targetScoreSet = new Set(targetScores.map((s) => s.scoring_instruction_uuid));
        const sourceScores = await tx.contactScore.findMany({
            where: { contact_uuid: source_uuid },
        });
        for (const row of sourceScores) {
            if (targetScoreSet.has(row.scoring_instruction_uuid)) {
                await tx.contactScore.delete({
                    where: {
                        contact_uuid_scoring_instruction_uuid: {
                            contact_uuid: source_uuid,
                            scoring_instruction_uuid: row.scoring_instruction_uuid,
                        },
                    },
                });
            } else {
                await tx.contactScore.update({
                    where: {
                        contact_uuid_scoring_instruction_uuid: {
                            contact_uuid: source_uuid,
                            scoring_instruction_uuid: row.scoring_instruction_uuid,
                        },
                    },
                    data: { contact_uuid: target_uuid },
                });
                targetScoreSet.add(row.scoring_instruction_uuid);
            }
        }

        const targetMembers = await tx.contactListMember.findMany({
            where: { contact_uuid: target_uuid },
            select: { list_uuid: true },
        });
        const targetListSet = new Set(targetMembers.map((m) => m.list_uuid));
        const sourceMembers = await tx.contactListMember.findMany({
            where: { contact_uuid: source_uuid },
        });
        for (const row of sourceMembers) {
            if (targetListSet.has(row.list_uuid)) {
                await tx.contactListMember.delete({
                    where: {
                        list_uuid_contact_uuid: {
                            list_uuid: row.list_uuid,
                            contact_uuid: source_uuid,
                        },
                    },
                });
            } else {
                await tx.contactListMember.update({
                    where: {
                        list_uuid_contact_uuid: {
                            list_uuid: row.list_uuid,
                            contact_uuid: source_uuid,
                        },
                    },
                    data: { contact_uuid: target_uuid },
                });
                targetListSet.add(row.list_uuid);
            }
        }

        const targetCampaignRows = await tx.marketingCampaignContact.findMany({
            where: { contact_uuid: target_uuid },
            select: { campaign_uuid: true, channel: true },
        });
        const targetCampaignSet = new Set(
            targetCampaignRows.map((r) => `${r.campaign_uuid}|${r.channel}`),
        );
        const sourceCampaignRows = await tx.marketingCampaignContact.findMany({
            where: { contact_uuid: source_uuid },
        });
        for (const row of sourceCampaignRows) {
            const key = `${row.campaign_uuid}|${row.channel}`;
            if (targetCampaignSet.has(key)) {
                await tx.marketingCampaignContact.delete({
                    where: { uuid: row.uuid },
                });
            } else {
                await tx.marketingCampaignContact.update({
                    where: { uuid: row.uuid },
                    data: { contact_uuid: target_uuid },
                });
                targetCampaignSet.add(key);
            }
        }

        await tx.interaction.updateMany({
            where: { contact_uuid: source_uuid },
            data: { contact_uuid: target_uuid },
        });
        await tx.outreachMessage.updateMany({
            where: { contact_uuid: source_uuid },
            data: { contact_uuid: target_uuid },
        });
        await tx.reminder.updateMany({
            where: { contact_uuid: source_uuid },
            data: { contact_uuid: target_uuid },
        });
        await tx.formCompletion.updateMany({
            where: { contact_uuid: source_uuid },
            data: { contact_uuid: target_uuid },
        });
        await tx.contactEnrichment.updateMany({
            where: { contact_uuid: source_uuid },
            data: { contact_uuid: target_uuid },
        });

        await tx.contact.delete({ where: { uuid: source_uuid } });
    });

    await elasticsearchService.deleteContact(source_uuid);
    const fresh = await prisma.contact.findUnique({
        where: { uuid: target_uuid },
        include: {
            lead: true,
            tags: true,
            contact_scores: {
                include: { scoring_instruction: { select: { uuid: true, name: true } } },
            },
        },
    });
    if (fresh) {
        await elasticsearchService.indexContact(fresh);
    }

    return target_uuid;
}

const filterForScoreInclude = {
    filter_scoring_instructions: { include: { scoring_instruction: true } },
} as const;

export type LinkedFilterForScore = Prisma.FilterGetPayload<{
    include: typeof filterForScoreInclude;
}>;

export async function loadLinkedFiltersForScore(
    prisma: PrismaClient,
    contact_uuid: string,
): Promise<LinkedFilterForScore[]> {
    const rows = await prisma.contactFilter.findMany({
        where: { contact_uuid },
        include: { filter: { include: filterForScoreInclude } },
    });
    return rows.map((row) => row.filter);
}

export function combineFiltersForScore(
    filters: LinkedFilterForScore[],
): LinkedFilterForScore | null {
    if (filters.length === 0) return null;
    const base = filters[0];
    const seen = new Set<string>();
    const mergedLinks = [];
    for (const filter of filters) {
        for (const link of filter.filter_scoring_instructions) {
            const id = link.scoring_instruction.uuid;
            if (seen.has(id)) continue;
            seen.add(id);
            mergedLinks.push(link);
        }
    }
    const enrichmentSet = new Set<typeof base.enrichment_sources[number]>();
    for (const filter of filters) {
        for (const source of filter.enrichment_sources) {
            enrichmentSet.add(source);
        }
    }
    return {
        ...base,
        enrichment_sources: [...enrichmentSet],
        filter_scoring_instructions: mergedLinks,
    };
}

export function unionEnrichmentSourcesFromFilters(
    filters: Array<{ enrichment_sources: LinkedFilterForScore['enrichment_sources'] }>,
): LinkedFilterForScore['enrichment_sources'] {
    const set = new Set<LinkedFilterForScore['enrichment_sources'][number]>();
    for (const filter of filters) {
        for (const source of filter.enrichment_sources) {
            set.add(source);
        }
    }
    return [...set];
}
