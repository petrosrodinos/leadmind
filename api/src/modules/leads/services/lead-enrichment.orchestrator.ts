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
    summarizeLinkedInPlain,
    toPlainRecord,
} from '../utils/enrichment-data.utils';
import { recomputeLeadEnrichmentSummary } from '../utils/lead-enrichment-summary.utils';
import { SOURCE_ORDER } from '../constants/enrichment.constants';

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
    ) {}

    async run(
        leadUuid: string,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        const force = opts?.force ?? false;
        const wanted = new Set(sources);
        const ordered = SOURCE_ORDER.filter((s) => wanted.has(s));

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

            switch (src) {
                case EnrichmentSource.LINKEDIN:
                    await this.runLinkedIn(lead, force);
                    break;
                case EnrichmentSource.WEBSITE:
                    await this.runWebsiteCrawl(lead, force);
                    break;
                case EnrichmentSource.GOOGLE_SEARCH:
                    await this.runGoogleSearch(lead, force);
                    break;
                case EnrichmentSource.AI:
                    await this.runAi(lead, force);
                    break;
                default: {
                    const _e: never = src;
                    void _e;
                }
            }
        }
    }

    private async hasSourceEnrichment(leadUuid: string, source: EnrichmentSource): Promise<boolean> {
        const row = await this.prisma.leadEnrichment.findFirst({
            where: { lead_uuid: leadUuid, source },
        });
        return Boolean(row);
    }

    private async appendEnrichment(
        leadUuid: string,
        data: {
            source: EnrichmentSource;
            source_url: string | null;
            summary: string;
            payload: Prisma.InputJsonValue;
            metadata?: Prisma.InputJsonValue | null;
        },
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.leadEnrichment.create({
                data: {
                    lead_uuid: leadUuid,
                    source: data.source,
                    source_url: data.source_url,
                    summary: data.summary,
                    payload: data.payload,
                    ...(data.metadata !== undefined && data.metadata !== null
                        ? { metadata: data.metadata }
                        : {}),
                },
            });
            await recomputeLeadEnrichmentSummary(tx, leadUuid);
        });
    }

    private async runLinkedIn(lead: Lead, force: boolean): Promise<void> {
        if (!force && (await this.hasSourceEnrichment(lead.uuid, EnrichmentSource.LINKEDIN))) {
            return;
        }
        const url = lead.linkedin_url?.trim();
        if (!url) {
            this.logger.warn(`Lead ${lead.uuid}: no linkedin_url`);
            return;
        }
        try {
            let plain: Record<string, unknown> | null = null;
            let meta: Record<string, string> | null = null;
            if (isLinkedInCompanyUrl(url)) {
                const row = await this.linkedInCompany.fetchCompany(url);
                plain = toPlainRecord(row);
                meta = { subtype: 'company' };
            } else if (isLinkedInProfileUrl(url)) {
                const row = await this.linkedInProfile.fetchProfile(url);
                plain = toPlainRecord(row);
                meta = { subtype: 'profile' };
            } else {
                const profile = await this.linkedInProfile.fetchProfile(url);
                plain = toPlainRecord(profile);
                meta = { subtype: 'profile' };
            }
            const payload = {
                fetched_at: new Date().toISOString(),
                data: plain,
            } satisfies Record<string, unknown>;
            const summary = summarizeLinkedInPlain(plain) || '(LinkedIn)';
            await this.appendEnrichment(lead.uuid, {
                source: EnrichmentSource.LINKEDIN,
                source_url: url,
                summary,
                payload: payload as Prisma.InputJsonValue,
                metadata: meta as Prisma.InputJsonValue,
            });
        } catch (error) {
            this.logger.warn(
                `Lead ${lead.uuid} LINKEDIN enrichment failed: ${error instanceof Error ? error.message : error}`,
            );
        }
    }

    private async runWebsiteCrawl(lead: Lead, force: boolean): Promise<void> {
        if (!force && (await this.hasSourceEnrichment(lead.uuid, EnrichmentSource.WEBSITE))) {
            return;
        }
        const w = lead.website?.trim();
        if (!w) {
            this.logger.warn(`Lead ${lead.uuid}: no website for crawl`);
            return;
        }
        try {
            const url = normalizeWebsiteUrl(w);
            const page = await this.websiteCrawler.crawlSinglePage(url);
            const textFull = page ? plainTextFromCrawledPage(page) : null;
            const textSample = textFull?.slice(0, 12000) ?? null;
            const mdSample = page?.markdown?.slice(0, 12000) ?? null;
            const payload = {
                fetched_at: new Date().toISOString(),
                url,
                title: page?.title ?? null,
                text_sample: textSample,
                markdown_sample: mdSample,
            } satisfies Record<string, unknown>;
            const raw = textSample?.trim() ?? '';
            const excerpt = raw.slice(0, 500);
            const summary =
                excerpt.length < raw.length ? `${excerpt}…` : excerpt || page?.title?.trim() || '(website)';
            await this.appendEnrichment(lead.uuid, {
                source: EnrichmentSource.WEBSITE,
                source_url: url,
                summary,
                payload: payload as Prisma.InputJsonValue,
            });
        } catch (error) {
            this.logger.warn(
                `Lead ${lead.uuid} WEBSITE crawl failed: ${error instanceof Error ? error.message : error}`,
            );
        }
    }

    private async runGoogleSearch(lead: Lead, force: boolean): Promise<void> {
        if (!force && (await this.hasSourceEnrichment(lead.uuid, EnrichmentSource.GOOGLE_SEARCH))) {
            return;
        }
        const parts = [lead.company, lead.name]
            .filter((x): x is string => Boolean(x?.trim()))
            .map((x) => x.trim());
        const query = parts.join(' ').slice(0, 280);
        if (!query) {
            this.logger.warn(`Lead ${lead.uuid}: no company/name for Google Search`);
            return;
        }
        try {
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
            const payload = {
                query,
                fetched_at: new Date().toISOString(),
                results: summaries,
            } satisfies Record<string, unknown>;
            const line = summaries
                .map((x) => x.title)
                .filter((x): x is string => Boolean(x?.trim()))
                .slice(0, 5)
                .join('; ');
            const summary = line || '(Google Search)';
            await this.appendEnrichment(lead.uuid, {
                source: EnrichmentSource.GOOGLE_SEARCH,
                source_url: query,
                summary,
                payload: payload as Prisma.InputJsonValue,
            });
        } catch (error) {
            this.logger.warn(
                `Lead ${lead.uuid} GOOGLE_SEARCH failed: ${error instanceof Error ? error.message : error}`,
            );
        }
    }

    private async runAi(lead: Lead, force: boolean): Promise<void> {
        if (!force && (await this.hasSourceEnrichment(lead.uuid, EnrichmentSource.AI))) {
            return;
        }
        let prefetched: string | null | undefined = undefined;
        const row = await this.prisma.leadEnrichment.findFirst({
            where: { lead_uuid: lead.uuid, source: EnrichmentSource.WEBSITE },
            orderBy: { created_at: 'desc' },
        });
        if (row?.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)) {
            const text = (row.payload as Record<string, unknown>).text_sample;
            if (typeof text === 'string' && text.length > 200) {
                prefetched = text;
            }
        }
        await this.leadAi.enrichWithAiFromWebsite(lead, {
            force,
            prefetchedPageText: prefetched,
        });
    }
}
