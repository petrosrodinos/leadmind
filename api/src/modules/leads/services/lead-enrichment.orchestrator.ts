import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Lead, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { LinkedInCompanyAdapter } from '@/integrations/apify/linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from '@/integrations/apify/linkedin-profile/linkedin-profile.adapter';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import { GoogleSearchAdapter } from '@/integrations/apify/google-search/google-search.adapter';
import { GemiService } from '@/integrations/gemi/gemi.service';
import { GemiCompany } from '@/integrations/gemi/gemi.interfaces';
import { LeadAiService } from '../utils/lead-ai.service';
import {
    buildGemiDocumentsEnrichmentSummary,
    extractArGemiFromLead,
    isGemiActivityActive,
    parseGemiCompanyFromLead,
} from '../utils/gemi-enrichment.utils';
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
import { OpenAiBatchRequest } from '@/integrations/ai/interfaces/openai-batch.interface';
import { AiModels } from '@/integrations/ai/interfaces/ai.interface';
import {
    buildGoogleEnrichmentSummaryUserPrompt,
    buildLeadAiResearchPrompt,
    buildLinkedInEnrichmentSummaryUserPrompt,
    buildWebsiteEnrichmentSummaryUserPrompt,
    GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    LEAD_ENRICHMENT_SYSTEM_PROMPT,
    LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
} from '../constants/ai-config';
import {
    googleSearchPayloadToContext,
    linkedInPlainForAiContext,
    websiteEnrichmentForAiContext,
} from '../utils/enrichment-data.utils';
import { leadHasAiResearchSeed } from '../constants/ai-config';
import type { LeadEnrichmentBatchLeadStaging } from '../interfaces/lead-enrichment-batch.interface';

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
        private readonly gemiService: GemiService,
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
            await this.persistEnrichmentAttempt(lead.uuid, { ...result, status: 'success' });
        } catch (error) {
            this.logger.warn(
                `Lead ${lead.uuid} ${source} enrichment failed: ${error instanceof Error ? error.message : error}`,
            );
            await this.persistEnrichmentAttempt(lead.uuid, this.buildFailedAttempt(lead, source, error));
        }
    }

    async persistEnrichmentAttempt(
        leadUuid: string,
        data: LeadEnrichmentAttemptInput,
        opts?: { skipSummaryRegen?: boolean },
    ): Promise<void> {
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
        if (!opts?.skipSummaryRegen) {
            await this.summaryService.regenerate(leadUuid);
        }
    }

    async prepareSourceBatchRequest(
        lead: Lead,
        source: EnrichmentSource,
    ): Promise<{ request: OpenAiBatchRequest; staging: LeadEnrichmentBatchLeadStaging } | null> {
        switch (source) {
            case EnrichmentSource.LINKEDIN:
                return this.prepareLinkedInBatch(lead);
            case EnrichmentSource.WEBSITE:
                return this.prepareWebsiteBatch(lead);
            case EnrichmentSource.GOOGLE_SEARCH:
                return this.prepareGoogleBatch(lead);
            case EnrichmentSource.AI:
                return this.prepareAiBatch(lead);
            case EnrichmentSource.GEMI:
                return null;
            default: {
                const _e: never = source;
                return null;
            }
        }
    }

    private async prepareLinkedInBatch(
        lead: Lead,
    ): Promise<{ request: OpenAiBatchRequest; staging: LeadEnrichmentBatchLeadStaging } | null> {
        const url = lead.linkedin_url?.trim();
        if (!url) {
            throw new Error('Lead has no linkedin_url');
        }
        let plain: Record<string, unknown> | null = null;
        let subtype: 'profile' | 'company' = 'profile';
        if (isLinkedInCompanyUrl(url)) {
            plain = toPlainRecord(await this.linkedInCompany.fetchCompany(url));
            subtype = 'company';
        } else if (isLinkedInProfileUrl(url)) {
            plain = toPlainRecord(await this.linkedInProfile.fetchProfile(url));
            subtype = 'profile';
        } else {
            plain = toPlainRecord(await this.linkedInProfile.fetchProfile(url));
            subtype = 'profile';
        }
        if (!plain) {
            throw new Error('LinkedIn scraper returned no data');
        }
        const context = linkedInPlainForAiContext(plain, subtype);
        return {
            staging: { linkedin: { url, subtype, plain } },
            request: {
                custom_id: `lead_enrich|linkedin|${lead.uuid}`,
                model: AiModels.openai.gpt4oMini,
                messages: [
                    { role: 'system', content: LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: buildLinkedInEnrichmentSummaryUserPrompt(context),
                    },
                ],
            },
        };
    }

    private async prepareWebsiteBatch(
        lead: Lead,
    ): Promise<{ request: OpenAiBatchRequest; staging: LeadEnrichmentBatchLeadStaging } | null> {
        const w = lead.website?.trim();
        if (!w) {
            throw new Error('Lead has no website for crawl');
        }
        const url = normalizeWebsiteUrl(w);
        const page = await this.websiteCrawler.crawlSinglePage(url);
        const textFull = page ? plainTextFromCrawledPage(page) : null;
        const textSample = textFull?.slice(0, 12000) ?? null;
        const mdSample = page?.markdown?.slice(0, 12000) ?? null;
        const context = websiteEnrichmentForAiContext({
            url,
            title: page?.title ?? null,
            textSample,
            markdownSample: mdSample,
        });
        return {
            staging: {
                website: {
                    url,
                    title: page?.title ?? null,
                    textSample,
                    markdownSample: mdSample,
                },
            },
            request: {
                custom_id: `lead_enrich|website|${lead.uuid}`,
                model: AiModels.openai.gpt4oMini,
                messages: [
                    { role: 'system', content: WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: buildWebsiteEnrichmentSummaryUserPrompt(context),
                    },
                ],
            },
        };
    }

    private async prepareGoogleBatch(
        lead: Lead,
    ): Promise<{ request: OpenAiBatchRequest; staging: LeadEnrichmentBatchLeadStaging } | null> {
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
        const resultsContext =
            googleSearchPayloadToContext({ results: summaries }) ?? '';
        return {
            staging: { google: { query, results: summaries } },
            request: {
                custom_id: `lead_enrich|google|${lead.uuid}`,
                model: AiModels.openai.gpt4oMini,
                messages: [
                    { role: 'system', content: GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: buildGoogleEnrichmentSummaryUserPrompt(query, resultsContext),
                    },
                ],
            },
        };
    }

    private async prepareAiBatch(
        lead: Lead,
        stagingHint?: LeadEnrichmentBatchLeadStaging,
    ): Promise<{ request: OpenAiBatchRequest; staging: LeadEnrichmentBatchLeadStaging } | null> {
        const websiteExcerpt = stagingHint?.website
            ? (stagingHint.website.textSample?.trim() ||
                  stagingHint.website.markdownSample?.trim() ||
                  null)
            : null;
        const linkedinExcerpt = stagingHint?.linkedin
            ? linkedInPlainForAiContext(stagingHint.linkedin.plain, stagingHint.linkedin.subtype)
            : null;
        const googleExcerpt = stagingHint?.google
            ? googleSearchPayloadToContext({ results: stagingHint.google.results })
            : null;

        if (
            !leadHasAiResearchSeed(lead) &&
            !websiteExcerpt?.trim() &&
            !linkedinExcerpt?.trim() &&
            !googleExcerpt?.trim()
        ) {
            throw new Error('Insufficient identity fields for AI research');
        }

        const prompt = buildLeadAiResearchPrompt(
            lead,
            websiteExcerpt,
            linkedinExcerpt,
            googleExcerpt,
        );

        return {
            staging: {
                ai: {
                    websiteExcerpt,
                    linkedinExcerpt,
                    googleExcerpt,
                },
            },
            request: {
                custom_id: `lead_enrich|ai|${lead.uuid}`,
                model: AiModels.openai.gpt4o,
                messages: [
                    { role: 'system', content: LEAD_ENRICHMENT_SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
            },
        };
    }

    async prepareLeadBatchRequests(
        lead: Lead,
        sources: EnrichmentSource[],
        force: boolean,
    ): Promise<{
        requests: OpenAiBatchRequest[];
        staging: LeadEnrichmentBatchLeadStaging;
        gemiPersisted: boolean;
    }> {
        const ordered = this.normalizeSources(sources);
        const requests: OpenAiBatchRequest[] = [];
        const staging: LeadEnrichmentBatchLeadStaging = {};
        let gemiPersisted = false;

        for (const src of ordered) {
            if (src === EnrichmentSource.GEMI) {
                if (!force && (await this.hasSourceEnrichment(lead.uuid, src))) {
                    continue;
                }
                await this.runSource(lead, src, force);
                gemiPersisted = true;
                continue;
            }

            if (!force && (await this.hasSourceEnrichment(lead.uuid, src))) {
                continue;
            }

            const currentLead =
                (await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } })) ?? lead;

            if (src === EnrichmentSource.AI) {
                const prep = await this.prepareAiBatch(currentLead, staging);
                if (prep) {
                    requests.push(prep.request);
                    Object.assign(staging, prep.staging);
                }
                continue;
            }

            try {
                const prep = await this.prepareSourceBatchRequest(currentLead, src);
                if (prep) {
                    requests.push(prep.request);
                    if (prep.staging.linkedin) {
                        staging.linkedin = prep.staging.linkedin;
                    }
                    if (prep.staging.website) {
                        staging.website = prep.staging.website;
                    }
                    if (prep.staging.google) {
                        staging.google = prep.staging.google;
                    }
                }
            } catch (error) {
                this.logger.warn(
                    `Lead ${lead.uuid} ${src} batch prepare failed: ${error instanceof Error ? error.message : error}`,
                );
                await this.persistEnrichmentAttempt(
                    lead.uuid,
                    this.buildFailedAttempt(currentLead, src, error),
                    { skipSummaryRegen: true },
                );
            }
        }

        return { requests, staging, gemiPersisted };
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
            case EnrichmentSource.GEMI:
                return this.executeGemi(lead);
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

    private async executeGemi(lead: Lead): Promise<LeadEnrichmentSourceResult> {
        const company = parseGemiCompanyFromLead(lead);
        if (!company) {
            throw new Error('Lead has no GEMI company data in raw_data');
        }
        const ar_gemi = extractArGemiFromLead(lead);
        if (ar_gemi == null) {
            throw new Error('Lead has no GEMI registry number (arGemi) in raw_data');
        }
        const documents = await this.gemiService.getCompanyDocuments(ar_gemi).catch(() => null);
        const summary = buildGemiDocumentsEnrichmentSummary(company, documents != null);
        const lead_update = this.buildLeadUpdateFromGemi(lead, company);
        return {
            source: EnrichmentSource.GEMI,
            source_url: String(ar_gemi),
            summary,
            payload: {
                fetched_at: new Date().toISOString(),
                ar_gemi,
                company: company as Record<string, unknown>,
                ...(documents ? { documents } : {}),
            } as Prisma.InputJsonValue,
            metadata: {
                legal_type: company.legalType?.descr ?? null,
                status: company.status?.descr ?? null,
                activity_count: company.activities?.length ?? 0,
                active_activity_count:
                    company.activities?.filter(isGemiActivityActive).length ?? 0,
                documents_fetched: documents != null,
            },
            ...(Object.keys(lead_update).length > 0 ? { lead_update } : {}),
        };
    }

    private buildLeadUpdateFromGemi(lead: Lead, company: GemiCompany): Prisma.LeadUpdateInput {
        const data: Prisma.LeadUpdateInput = {};
        const take = (current: string | null | undefined, next: unknown): string | undefined => {
            if (typeof next !== 'string' || !next.trim()) {
                return undefined;
            }
            if (String(current ?? '').trim()) {
                return undefined;
            }
            return next.trim();
        };
        const first_person = company.persons?.find((p) => p.personName);
        const primary_activity =
            company.activities?.find((a) => isGemiActivityActive(a))?.activity ??
            company.activities?.[0]?.activity;
        const location_parts = [company.city, company.prefecture?.descr].filter(Boolean);
        const n = take(lead.name, first_person?.personName);
        if (n) data.name = n;
        const e = take(lead.email, company.email);
        if (e) data.email = e;
        const ph = take(lead.phone, company.phone);
        if (ph) data.phone = ph;
        const c = take(lead.company, company.coNameEl ?? company.coNamesEn?.[0]);
        if (c) data.company = c;
        const w = take(lead.website, company.url);
        if (w) data.website = w;
        const t = take(lead.title, first_person?.role);
        if (t) data.title = t;
        const loc = take(lead.location, location_parts.join(', ') || undefined);
        if (loc) data.location = loc;
        const ind = take(lead.industry, primary_activity?.descr);
        if (ind) data.industry = ind;
        const desc = take(lead.description, company.objective);
        if (desc) {
            data.description = desc.slice(0, 8000);
        }
        return data;
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
        if (source === EnrichmentSource.GEMI) {
            const ar = extractArGemiFromLead(lead);
            return ar != null ? String(ar) : null;
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
