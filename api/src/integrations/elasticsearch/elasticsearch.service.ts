import {
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { Contact, ContactTag, Lead } from '@/generated/prisma';
import { AiService } from '@/integrations/ai/services/ai.service';
import {
    CONTACTS_INDEX,
    CONTACTS_MAPPING,
    ELASTICSEARCH_CLIENT,
    LEADS_INDEX,
    LEADS_MAPPING,
} from './elasticsearch.constants';
import {
    SearchQuery,
    SearchResult,
} from './interfaces/elasticsearch.interfaces';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private readonly logger = new Logger(ElasticsearchService.name);

    constructor(
        @Inject(ELASTICSEARCH_CLIENT) private readonly client: Client | null,
        private readonly aiService: AiService,
    ) { }

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
            const embedding = await this.embed(metadata);
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

    async indexContact(
        contact: Contact & { lead: Lead; tags: ContactTag[] },
    ): Promise<void> {
        if (!this.client) return;
        try {
            const tags = contact.tags.map((t) => t.tag);
            const metadata = this.buildContactMetadata(contact, tags);
            const embedding = await this.embed(metadata);
            await this.client.index({
                index: CONTACTS_INDEX,
                id: contact.uuid,
                document: {
                    uuid: contact.uuid,
                    user_uuid: contact.user_uuid,
                    lead_uuid: contact.lead_uuid,
                    status: contact.status,
                    score: contact.score,
                    tags,
                    name: contact.lead.name,
                    email: contact.lead.email,
                    company: contact.lead.company,
                    title: contact.lead.title,
                    industry: contact.lead.industry,
                    location: contact.lead.location,
                    description: contact.lead.description,
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
        if (query.min_score != null) filter.push({ range: { score: { gte: query.min_score } } });
        if (query.tags && query.tags.length > 0) filter.push({ terms: { tags: query.tags } });

        return this.runSearch(CONTACTS_INDEX, query, filter);
    }

    private async runSearch(
        index: string,
        query: SearchQuery,
        filter: any[],
    ): Promise<SearchResult> {
        if (!this.client) return { hits: [], total: 0 };

        const limit = query.limit ?? 20;
        const page = query.page ?? 1;
        const from = (page - 1) * limit;

        if (query.q) {
            const vector = await this.embed(query.q);
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
        const enrichmentSummary =
            lead.enrichment_data && typeof lead.enrichment_data === 'object' && 'summary' in lead.enrichment_data
                ? String((lead.enrichment_data as { summary?: unknown }).summary ?? '')
                : '';
        return [
            lead.name && `Name: ${lead.name}`,
            lead.title && `Title: ${lead.title}`,
            lead.company && `Company: ${lead.company}`,
            lead.industry && `Industry: ${lead.industry}`,
            lead.location && `Location: ${lead.location}`,
            lead.website && `Website: ${lead.website}`,
            lead.description && `Description: ${lead.description}`,
            enrichmentSummary && `Summary: ${enrichmentSummary}`,
        ]
            .filter(Boolean)
            .join('\n');
    }

    private buildContactMetadata(
        contact: Contact & { lead: Lead },
        tags: string[],
    ): string {
        const parts = [
            contact.status && `Status: ${contact.status}`,
            contact.score != null && `Score: ${contact.score}`,
            tags.length > 0 && `Tags: ${tags.join(', ')}`,
            contact.notes && `Notes: ${contact.notes}`,
            this.buildLeadMetadata(contact.lead),
        ];
        return parts.filter(Boolean).join('\n');
    }

    private async embed(text: string): Promise<number[]> {
        return this.aiService.embedText(text.trim() || ' ');
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
