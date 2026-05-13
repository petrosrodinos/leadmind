import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Lead, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { LinkedInCompanyAdapter } from '@/integrations/apify/linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from '@/integrations/apify/linkedin-profile/linkedin-profile.adapter';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import { GoogleSearchAdapter } from '@/integrations/apify/google-search/google-search.adapter';
import { LeadAiService } from '../utils/lead-ai.service';
import {
    isLinkedInCompanyUrl,
    isLinkedInProfileUrl,
    normalizeWebsiteUrl,
    toPlainRecord,
} from '../utils/enrichment-data.utils';
import { normalizeEnrichmentSources } from '../utils/enrichment-sources.utils';
import { LeadEnrichmentSummaryService } from './lead-enrichment-summary.service';
import {
    LeadEnrichmentAttemptInput,
    LeadEnrichmentSourceResult,
} from '../interfaces/lead-enrichment-execution.interface';

@Injectable()
export class LeadEnrichmentOrchestrator {
    private readonly logger = new Logger(LeadEnrichmentOrchestrator.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly leadAi: LeadAiService,
        private readonly linkedInCompany: LinkedInCompanyAdapter,
        private readonly linkedInProfile: LinkedInProfileAdapter,
        private readonly websiteCrawler: WebsiteContentCrawlerAdapter,
        private readonly googleSearch: GoogleSearchAdapter,
        private readonly summaryService: LeadEnrichmentSummaryService,
    ) {}

    async run(
        leadUuid: string,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        const force = opts?.force ?? false;
        const ordered = this.normalizeSources(sources);

        let lead = await this.prisma.lead.findUnique({ where: { uuid: leadUuid } });
        if (!lead) {
            this.logger.warn(`Lead ${leadUuid} not found`);
            return;
        }

        for (const src of ordered) {
            lead = await this.prisma.lead.findUnique({ where: { uuid: leadUuid } });
            if (!lead) {
                return;
            }

            if (!force && (await this.hasSourceEnrichment(lead.uuid, src))) {
                continue;
            }

            await this.runSource(lead, src, force);
        }
    }

    private normalizeSources(sources: EnrichmentSource[]): EnrichmentSource[] {
        return normalizeEnrichmentSources(sources);
    }

    private async hasSourceEnrichment(leadUuid: string, source: EnrichmentSource): Promise<boolean> {
        const row = await this.prisma.leadEnrichment.findFirst({
            where: { lead_uuid: leadUuid, source },
        });
        return Boolean(row);
    }

    private async runSource(lead: Lead, source: EnrichmentSource, force: boolean): Promise<void> {
        try {
            const result = await this.executeSource(lead, source, force);
            await this.persistAttempt(lead.uuid, { ...result, status: 'success' });
        } catch (error) {
            this.logger.warn(
                `Lead ${lead.uuid} ${source} enrichment failed: ${error instanceof Error ? error.message : error}`,
            );
            await this.persistAttempt(lead.uuid, this.buildFailedAttempt(lead, source, error));
        }
    }

    private async persistAttempt(leadUuid: string, data: LeadEnrichmentAttemptInput): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.leadEnrichment.create({
                data: {
                    lead_uuid: leadUuid,
                    source: data.source,
                    source_url: data.source_url,
                    summary: data.summary,
                    payload: data.payload,
                    cost_usd: data.cost_usd ?? null,
                    input_tokens: data.input_tokens ?? null,
                    output_tokens: data.output_tokens ?? null,
                    metadata: this.mergeMetadata(data.metadata, { status: data.status }),
                },
            });
            if (data.lead_update && Object.keys(data.lead_update).length > 0) {
                await tx.lead.update({
                    where: { uuid: leadUuid },
                    data: data.lead_update,
                });
            }
        });
        await this.summaryService.regenerate(leadUuid);
    }

    private async executeSource(
        lead: Lead,
        source: EnrichmentSource,
        force: boolean,
    ): Promise<LeadEnrichmentSourceResult> {
        switch (source) {
            case EnrichmentSource.LINKEDIN:
                return this.executeLinkedIn(lead);
            case EnrichmentSource.WEBSITE:
                return this.executeWebsite(lead);
            case EnrichmentSource.GOOGLE_SEARCH:
                return this.executeGoogleSearch(lead);
            case EnrichmentSource.AI:
                return this.executeAiSearch(lead, force);
            default: {
                const _e: never = source;
                throw new Error(`Unsupported enrichment source: ${_e}`);
            }
        }
    }

    private async executeLinkedIn(lead: Lead): Promise<LeadEnrichmentSourceResult> {
        const url = lead.linkedin_url?.trim();
        if (!url) {
            throw new Error('Lead has no linkedin_url');
        }
        let plain: Record<string, unknown> | null = null;
        let subtype: 'profile' | 'company' = 'profile';
        if (isLinkedInCompanyUrl(url)) {
            const row = await this.linkedInCompany.fetchCompany(url);
            plain = toPlainRecord(row);
            subtype = 'company';
        } else if (isLinkedInProfileUrl(url)) {
            const row = await this.linkedInProfile.fetchProfile(url);
            plain = toPlainRecord(row);
            subtype = 'profile';
        } else {
            const profile = await this.linkedInProfile.fetchProfile(url);
            plain = toPlainRecord(profile);
            subtype = 'profile';
        }
        if (!plain) {
            throw new Error('LinkedIn scraper returned no data');
        }
        const li = await this.leadAi.summarizeLinkedInEnrichment(plain, subtype);
        return {
            source: EnrichmentSource.LINKEDIN,
            source_url: url,
            summary: li.summary,
            payload: {
                fetched_at: new Date().toISOString(),
                data: plain,
            } as Prisma.InputJsonValue,
            metadata: { subtype },
            lead_update: this.buildLeadUpdateFromLinkedIn(lead, plain, subtype),
            cost_usd: li.cost_usd,
            input_tokens: li.input_tokens,
            output_tokens: li.output_tokens,
        };
    }

    private buildLeadUpdateFromLinkedIn(
        lead: Lead,
        plain: Record<string, unknown> | null,
        subtype: 'profile' | 'company',
    ): Prisma.LeadUpdateInput {
        const data: Prisma.LeadUpdateInput = {};
        if (!plain) {
            return data;
        }
        const take = (current: string | null | undefined, next: unknown): string | undefined => {
            if (typeof next !== 'string' || !next.trim()) {
                return undefined;
            }
            if (String(current ?? '').trim()) {
                return undefined;
            }
            return next.trim();
        };
        if (subtype === 'profile') {
            const n = take(lead.name, plain.name);
            if (n) data.name = n;
            const e = take(lead.email, plain.email);
            if (e) data.email = e;
            const ph = take(lead.phone, plain.phone);
            if (ph) data.phone = ph;
            const t = take(lead.title, plain.title);
            if (t) data.title = t;
            const c = take(lead.company, plain.company);
            if (c) data.company = c;
            const w = take(lead.website, plain.website);
            if (w) data.website = w;
            const loc = take(lead.location, plain.location);
            if (loc) data.location = loc;
            const ind = take(lead.industry, plain.industry);
            if (ind) data.industry = ind;
            const li = take(lead.linkedin_url, plain.linkedin_url);
            if (li) data.linkedin_url = li;
            const about =
                typeof plain.about === 'string'
                    ? plain.about
                    : typeof plain.headline === 'string'
                      ? plain.headline
                      : null;
            const desc = take(lead.description, about);
            if (desc) {
                data.description = desc.slice(0, 8000);
            }
        } else {
            const cn = take(lead.company, plain.name);
            if (cn) data.company = cn;
            const w = take(lead.website, plain.website);
            if (w) data.website = w;
            const ind = take(lead.industry, plain.industry);
            if (ind) data.industry = ind;
            const ph = take(lead.phone, plain.phone);
            if (ph) data.phone = ph;
            const e = take(lead.email, plain.email);
            if (e) data.email = e;
            const body =
                typeof plain.description === 'string'
                    ? plain.description
                    : typeof plain.tagline === 'string'
                      ? plain.tagline
                      : null;
            const desc = take(lead.description, body);
            if (desc) {
                data.description = desc.slice(0, 8000);
            }
        }
        if (Object.keys(data).length === 0) {
            return data;
        }
        return data;
    }

    private async executeWebsite(lead: Lead): Promise<LeadEnrichmentSourceResult> {
        const w = lead.website?.trim();
        if (!w) {
            throw new Error('Lead has no website for crawl');
        }
        const url = normalizeWebsiteUrl(w);
        const page = await this.websiteCrawler.crawlSinglePage(url);
        const textFull = page ? plainTextFromCrawledPage(page) : null;
        const textSample = textFull?.slice(0, 12000) ?? null;
        const mdSample = page?.markdown?.slice(0, 12000) ?? null;
        const ws = await this.leadAi.summarizeWebsiteEnrichment({
            url,
            title: page?.title ?? null,
            textSample,
            markdownSample: mdSample,
        });
        return {
            source: EnrichmentSource.WEBSITE,
            source_url: url,
            summary: ws.summary,
            payload: {
                fetched_at: new Date().toISOString(),
                url,
                title: page?.title ?? null,
                text_sample: textSample,
                markdown_sample: mdSample,
            },
            cost_usd: ws.cost_usd,
            input_tokens: ws.input_tokens,
            output_tokens: ws.output_tokens,
        };
    }

    private async executeGoogleSearch(lead: Lead): Promise<LeadEnrichmentSourceResult> {
        const parts = [lead.company, lead.name]
            .filter((x): x is string => Boolean(x?.trim()))
            .map((x) => x.trim());
        const query = parts.join(' ').slice(0, 280);
        if (!query) {
            throw new Error('Lead has no company/name for Google Search');
        }
        const raw = await this.googleSearch.fetchRawItems({
            queries: query,
            results_per_page: 8,
            max_pages_per_query: 1,
        });
        const summaries: { title?: string; url?: string; snippet?: string }[] = [];
        for (const item of raw) {
            const organic = [...(item.organicResults ?? []), ...(item.paidResults ?? [])];
            for (const r of organic) {
                summaries.push({
                    title: r.title,
                    url: r.url,
                    snippet: (r.description ?? r.snippet) as string | undefined,
                });
                if (summaries.length >= 14) {
                    break;
                }
            }
            if (summaries.length >= 14) {
                break;
            }
        }
        const gs = await this.leadAi.summarizeGoogleSearchEnrichment({ query, results: summaries });
        return {
            source: EnrichmentSource.GOOGLE_SEARCH,
            source_url: query,
            summary: gs.summary,
            payload: {
                query,
                fetched_at: new Date().toISOString(),
                results: summaries,
            },
            cost_usd: gs.cost_usd,
            input_tokens: gs.input_tokens,
            output_tokens: gs.output_tokens,
        };
    }

    private async executeAiSearch(lead: Lead, force: boolean): Promise<LeadEnrichmentSourceResult> {
        const result = await this.leadAi.buildAiEnrichmentResult(lead, { force });
        if (!result) {
            throw new Error('AI enrichment returned no result');
        }
        return result;
    }

    private buildFailedAttempt(
        lead: Lead,
        source: EnrichmentSource,
        error: unknown,
    ): LeadEnrichmentAttemptInput {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const name = error instanceof Error ? error.name : 'Error';
        return {
            source,
            source_url: this.sourceUrlForFailure(lead, source),
            summary: `${source} enrichment failed: ${message}`,
            payload: {
                failed_at: new Date().toISOString(),
                error: message,
            },
            metadata: {
                error_name: name,
                error_message: message,
            },
            status: 'failed',
        };
    }

    private sourceUrlForFailure(lead: Lead, source: EnrichmentSource): string | null {
        if (source === EnrichmentSource.LINKEDIN) {
            return lead.linkedin_url?.trim() || null;
        }
        if (source === EnrichmentSource.WEBSITE) {
            return lead.website?.trim() ? normalizeWebsiteUrl(lead.website.trim()) : null;
        }
        if (source === EnrichmentSource.GOOGLE_SEARCH) {
            return [lead.company, lead.name]
                .filter((x): x is string => Boolean(x?.trim()))
                .map((x) => x.trim())
                .join(' ')
                .slice(0, 280) || null;
        }
        if (source === EnrichmentSource.AI) {
            return lead.website?.trim() ? normalizeWebsiteUrl(lead.website.trim()) : null;
        }
        return lead.linkedin_url?.trim() || lead.website?.trim() || null;
    }

    private mergeMetadata(
        metadata: Prisma.InputJsonValue | null | undefined,
        base: Record<string, unknown>,
    ): Prisma.InputJsonValue {
        if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
            return { ...metadata, ...base } as Prisma.InputJsonValue;
        }
        return base as Prisma.InputJsonValue;
    }
}
