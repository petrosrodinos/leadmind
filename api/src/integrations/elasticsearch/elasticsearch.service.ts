import {
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import {
    Contact,
    ContactScore,
    ContactTag,
    Lead,
    ScoringInstruction,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import {
    CONTACTS_INDEX,
    CONTACTS_MAPPING,
    ELASTICSEARCH_CLIENT,
    LEADS_INDEX,
    LEADS_MAPPING,
} from './elasticsearch.constants';
import { ELASTICSEARCH_CONFIG } from './elasticsearch.config';
import {
    SearchQuery,
    SearchResult,
} from './interfaces/elasticsearch.interfaces';

type ContactForIndex = Contact & {
    lead: Lead;
    tags: ContactTag[];
    contact_scores?: (ContactScore & {
        scoring_instruction?: Pick<ScoringInstruction, 'uuid' | 'name'>;
    })[];
};

@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private readonly logger = new Logger(ElasticsearchService.name);

    constructor(
        @Inject(ELASTICSEARCH_CLIENT) private readonly client: Client | null,
        private readonly aiService: AiService,
        private readonly prisma: PrismaService,
    ) {}

    get enabled(): boolean {
        return this.client !== null;
    }

    async onModuleInit(): Promise<void> {
        if (!this.client) return;
        try {
            await this.ensureIndex(LEADS_INDEX, LEADS_MAPPING);
            await this.ensureIndex(CONTACTS_INDEX, CONTACTS_MAPPING);
        } catch (error) {
            this.logger.warn(
                `Elasticsearch unreachable at startup: ${this.errMsg(error)} — search features disabled`,
            );
        }
    }

    private async ensureIndex(
        index: string,
        mappings: { properties: Record<string, any> },
    ): Promise<void> {
        if (!this.client) return;
        const exists = await this.client.indices.exists({ index });
        if (exists) return;
        await this.client.indices.create({ index, mappings });
        this.logger.log(`Created Elasticsearch index: ${index}`);
    }

    async indexLead(lead: Lead): Promise<void> {
        if (!this.client) return;
        try {
            const metadata = this.buildLeadMetadata(lead);
            const user_uuid = await this.resolveUserUuidForLead(lead.uuid);
            const embedding = user_uuid ? await this.embed(user_uuid, metadata) : [];
            await this.client.index({
                index: LEADS_INDEX,
                id: lead.uuid,
                document: {
                    uuid: lead.uuid,
                    name: lead.name,
                    email: lead.email,
                    company: lead.company,
                    title: lead.title,
                    industry: lead.industry,
                    location: lead.location,
                    description: lead.description,
                    source_type: lead.source_type,
                    linkedin_url: lead.linkedin_url,
                    metadata,
                    embedding,
                    created_at: lead.created_at,
                },
            });
        } catch (error) {
            this.logger.warn(`indexLead(${lead.uuid}) failed: ${this.errMsg(error)}`);
        }
    }

    async indexContact(contact: ContactForIndex): Promise<void> {
        if (!this.client) return;
        try {
            const tags = contact.tags.map((t) => t.tag);
            const metadata = this.buildContactMetadata(contact, tags);
            const embedding = await this.embed(contact.user_uuid, metadata);
            const scores =
                contact.contact_scores?.map((cs) => ({
                    scoring_instruction_uuid: cs.scoring_instruction_uuid,
                    score: cs.score,
                })) ?? [];
            await this.client.index({
                index: CONTACTS_INDEX,
                id: contact.uuid,
                document: {
                    uuid: contact.uuid,
                    user_uuid: contact.user_uuid,
                    lead_uuid: contact.lead_uuid,
                    status: contact.status,
                    scores,
                    tags,
                    name: contact.name,
                    email: contact.email,
                    company: contact.company,
                    title: contact.title,
                    industry: contact.industry,
                    location: contact.location,
                    description: contact.description,
                    metadata,
                    embedding,
                    created_at: contact.created_at,
                },
            });
        } catch (error) {
            this.logger.warn(
                `indexContact(${contact.uuid}) failed: ${this.errMsg(error)}`,
            );
        }
    }

    async deleteLead(uuid: string): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.delete({ index: LEADS_INDEX, id: uuid });
        } catch (error: any) {
            if (error?.meta?.statusCode === 404) return;
            this.logger.warn(`deleteLead(${uuid}) failed: ${this.errMsg(error)}`);
        }
    }

    async deleteContact(uuid: string): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.delete({ index: CONTACTS_INDEX, id: uuid });
        } catch (error: any) {
            if (error?.meta?.statusCode === 404) return;
            this.logger.warn(`deleteContact(${uuid}) failed: ${this.errMsg(error)}`);
        }
    }

    async searchLeads(query: SearchQuery): Promise<SearchResult> {
        if (!this.client) return { hits: [], total: 0 };

        const filter: any[] = [];
        if (query.source_type) filter.push({ term: { source_type: query.source_type } });

        return this.runSearch(LEADS_INDEX, query, filter);
    }

    async searchContacts(
        userUuid: string,
        query: SearchQuery,
    ): Promise<SearchResult> {
        if (!this.client) return { hits: [], total: 0 };

        const filter: any[] = [{ term: { user_uuid: userUuid } }];
        if (query.status) filter.push({ term: { status: query.status } });
        if (query.score_rules && query.score_rules.length > 0) {
            for (const rule of query.score_rules) {
                filter.push({
                    nested: {
                        path: 'scores',
                        query: {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            'scores.scoring_instruction_uuid':
                                                rule.scoring_instruction_uuid,
                                        },
                                    },
                                    { range: { 'scores.score': { gte: rule.min } } },
                                ],
                            },
                        },
                    },
                });
            }
        }
        if (query.tags && query.tags.length > 0) filter.push({ terms: { tags: query.tags } });

        return this.runSearch(CONTACTS_INDEX, query, filter, userUuid);
    }

    private async runSearch(
        index: string,
        query: SearchQuery,
        filter: any[],
        userUuid?: string,
    ): Promise<SearchResult> {
        if (!this.client) return { hits: [], total: 0 };

        const limit = query.limit ?? 20;
        const page = query.page ?? 1;
        const from = (page - 1) * limit;

        if (query.q && userUuid && ELASTICSEARCH_CONFIG.create_embedding) {
            const vector = await this.embed(userUuid, query.q);
            const response = await this.client.search({
                index,
                from,
                size: limit,
                _source_excludes: ['embedding'],
                knn: {
                    field: 'embedding',
                    query_vector: vector,
                    k: limit * 5,
                    num_candidates: Math.max(limit * 20, 100),
                    filter,
                },
            });
            return this.formatResponse(response);
        }

        const response = await this.client.search({
            index,
            from,
            size: limit,
            _source_excludes: ['embedding'],
            query: { bool: { must: [{ match_all: {} }], filter } },
        });
        return this.formatResponse(response);
    }

    private buildLeadMetadata(lead: Lead): string {
        const enrichmentSummary = lead.enrichment_summary?.trim() ?? '';
        return [
            lead.name && `Name: ${lead.name}`,
            lead.title && `Title: ${lead.title}`,
            lead.company && `Company: ${lead.company}`,
            lead.industry && `Industry: ${lead.industry}`,
            lead.location && `Location: ${lead.location}`,
            lead.website && `Website: ${lead.website}`,
            lead.google_maps_url && `Google Maps: ${lead.google_maps_url}`,
            lead.description && `Description: ${lead.description}`,
            enrichmentSummary && `Summary: ${enrichmentSummary}`,
        ]
            .filter(Boolean)
            .join('\n');
    }

    private buildContactIdentityBlock(contact: Contact): string {
        return [
            contact.name && `Name: ${contact.name}`,
            contact.title && `Title: ${contact.title}`,
            contact.company && `Company: ${contact.company}`,
            contact.industry && `Industry: ${contact.industry}`,
            contact.location && `Location: ${contact.location}`,
            contact.website && `Website: ${contact.website}`,
            contact.google_maps_url && `Google Maps: ${contact.google_maps_url}`,
            contact.email && `Email: ${contact.email}`,
            contact.phone && `Phone: ${contact.phone}`,
            contact.linkedin_url && `LinkedIn: ${contact.linkedin_url}`,
            contact.description && `Description: ${contact.description}`,
        ]
            .filter(Boolean)
            .join('\n');
    }

    private buildLeadEnrichmentBlock(lead: Lead): string {
        const enrichmentSummary = lead.enrichment_summary?.trim() ?? '';
        return enrichmentSummary ? `Summary: ${enrichmentSummary}` : '';
    }

    private buildContactMetadata(contact: ContactForIndex, tags: string[]): string {
        const scoreLines =
            contact.contact_scores?.map((cs) => {
                const label = cs.scoring_instruction?.name ?? cs.scoring_instruction_uuid;
                return `Score (${label}): ${cs.score}`;
            }) ?? [];
        const enrichmentSummary =
            contact.enrichment_summary?.trim() ||
            contact.lead.enrichment_summary?.trim() ||
            '';
        const enrichmentBlock = enrichmentSummary ? `Summary: ${enrichmentSummary}` : '';
        const parts = [
            contact.status && `Status: ${contact.status}`,
            ...scoreLines,
            tags.length > 0 && `Tags: ${tags.join(', ')}`,
            contact.notes && `Notes: ${contact.notes}`,
            this.buildContactIdentityBlock(contact),
            enrichmentBlock,
        ];
        return parts.filter(Boolean).join('\n');
    }

    private async embed(user_uuid: string, text: string): Promise<number[]> {
        if (!ELASTICSEARCH_CONFIG.create_embedding) {
            return [];
        }

        return this.aiService.embedText(user_uuid, text.trim() || ' ', {
            operation: 'EMBEDDING',
        });
    }

    private async resolveUserUuidForLead(leadUuid: string): Promise<string | null> {
        const contact = await this.prisma.contact.findFirst({
            where: { lead_uuid: leadUuid },
            select: { user_uuid: true },
        });
        return contact?.user_uuid ?? null;
    }

    private formatResponse(response: any): SearchResult {
        const hits = response.hits?.hits ?? [];
        const total =
            typeof response.hits?.total === 'number'
                ? response.hits.total
                : response.hits?.total?.value ?? 0;
        return {
            hits: hits.map((hit: any) => ({ _id: hit._id, _score: hit._score, ...hit._source })),
            total,
        };
    }

    private errMsg(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
