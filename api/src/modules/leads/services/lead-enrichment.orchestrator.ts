import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Lead } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { LinkedInCompanyAdapter } from '@/integrations/apify/linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from '@/integrations/apify/linkedin-profile/linkedin-profile.adapter';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import { GoogleSearchAdapter } from '@/integrations/apify/google-search/google-search.adapter';
import { GemiService } from '@/integrations/gemi/gemi.service';
import { LeadAiService } from '../utils/lead-ai.service';
import {
    googleSearchPayloadToContext,
    isLinkedInCompanyUrl,
    isLinkedInProfileUrl,
    linkedInPlainForAiContext,
    normalizeWebsiteUrl,
    toPlainRecord,
    websiteEnrichmentForAiContext,
} from '../utils/enrichment-data.utils';
import { normalizeEnrichmentSources } from '../utils/enrichment-sources.utils';
import { EnrichmentOrchestrator } from '@/modules/enrichment/services/enrichment.orchestrator';
import { EnrichmentSummaryService } from '@/modules/enrichment/services/enrichment-summary.service';
import { EnrichmentProfileUpdate, leadToEnrichmentSubject } from '@/modules/enrichment/utils/enrichment-subject.utils';
import {
    LeadEnrichmentAttemptInput,
} from '../interfaces/lead-enrichment-execution.interface';
import { OpenAiBatchRequest } from '@/integrations/ai/interfaces/openai-batch.interface';
import { AiModels } from '@/integrations/ai/interfaces/ai.interface';
import {
    buildGoogleEnrichmentSummaryUserPrompt,
    buildLinkedInEnrichmentSummaryUserPrompt,
    buildWebsiteEnrichmentSummaryUserPrompt,
    GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
} from '../constants/ai-config';
import type { LeadEnrichmentBatchLeadStaging } from '../interfaces/lead-enrichment-batch.interface';

@Injectable()
export class LeadEnrichmentOrchestrator extends EnrichmentOrchestrator {
    private readonly batchLogger = new Logger(LeadEnrichmentOrchestrator.name);

    constructor(
        prisma: PrismaService,
        leadAi: LeadAiService,
        linkedInCompany: LinkedInCompanyAdapter,
        linkedInProfile: LinkedInProfileAdapter,
        websiteCrawler: WebsiteContentCrawlerAdapter,
        googleSearch: GoogleSearchAdapter,
        gemiService: GemiService,
        summaryService: EnrichmentSummaryService,
    ) {
        super(
            prisma,
            leadAi,
            linkedInCompany,
            linkedInProfile,
            websiteCrawler,
            googleSearch,
            gemiService,
            summaryService,
        );
    }

    async run(
        leadUuid: string,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        return this.runForLead(leadUuid, sources, opts);
    }

    async persistEnrichmentAttempt(
        leadUuid: string,
        data: LeadEnrichmentAttemptInput,
        opts?: { skipSummaryRegen?: boolean },
    ): Promise<void> {
        const { lead_update, ...rest } = data;
        await this.persistAttempt(
            { kind: 'lead', uuid: leadUuid },
            {
                ...rest,
                ...(lead_update && Object.keys(lead_update).length > 0
                    ? { entity_update: lead_update as EnrichmentProfileUpdate }
                    : {}),
            },
            opts,
        );
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
                return null;
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

    async prepareLeadBatchRequests(
        lead: Lead,
        sources: EnrichmentSource[],
        force: boolean,
    ): Promise<{
        requests: OpenAiBatchRequest[];
        staging: LeadEnrichmentBatchLeadStaging;
        gemiPersisted: boolean;
    }> {
        const ordered = normalizeEnrichmentSources(sources);
        const requests: OpenAiBatchRequest[] = [];
        const staging: LeadEnrichmentBatchLeadStaging = {};
        let gemiPersisted = false;

        for (const src of ordered) {
            if (src === EnrichmentSource.GEMI) {
                if (!force && (await this.hasSourceEnrichment({ kind: 'lead', uuid: lead.uuid }, src))) {
                    continue;
                }
                await this.runSourceLead(lead, src, force);
                gemiPersisted = true;
                continue;
            }

            if (!force && (await this.hasSourceEnrichment({ kind: 'lead', uuid: lead.uuid }, src))) {
                continue;
            }

            const currentLead =
                (await this.prisma.lead.findUnique({ where: { uuid: lead.uuid } })) ?? lead;

            if (src === EnrichmentSource.AI) {
                try {
                    const prefetchedPageText =
                        staging.website?.textSample?.trim() ||
                        staging.website?.markdownSample?.trim() ||
                        null;
                    const linkedinProfileExcerpt = staging.linkedin
                        ? linkedInPlainForAiContext(
                              staging.linkedin.plain,
                              staging.linkedin.subtype,
                          )
                        : null;
                    const result = await this.leadAi.buildAiEnrichmentResult(currentLead, {
                        prefetchedPageText,
                        linkedinProfileExcerpt,
                        historyTarget: { kind: 'lead', uuid: currentLead.uuid },
                    });
                    if (result) {
                        await this.persistEnrichmentAttempt(
                            currentLead.uuid,
                            { ...result, status: 'success' },
                            { skipSummaryRegen: true },
                        );
                    }
                } catch (error) {
                    this.batchLogger.warn(
                        `Lead ${lead.uuid} AI enrichment failed: ${error instanceof Error ? error.message : error}`,
                    );
                    await this.persistEnrichmentAttempt(
                        lead.uuid,
                        this.buildFailedAttempt(leadToEnrichmentSubject(currentLead), src, error),
                        { skipSummaryRegen: true },
                    );
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
                this.batchLogger.warn(
                    `Lead ${lead.uuid} ${src} batch prepare failed: ${error instanceof Error ? error.message : error}`,
                );
                await this.persistEnrichmentAttempt(
                    lead.uuid,
                    this.buildFailedAttempt(leadToEnrichmentSubject(currentLead), src, error),
                    { skipSummaryRegen: true },
                );
            }
        }

        return { requests, staging, gemiPersisted };
    }
}
