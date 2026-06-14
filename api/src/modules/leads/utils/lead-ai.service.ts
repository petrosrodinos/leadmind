import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Lead, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiConfig } from '@/integrations/ai/utils/ai.config';
import { AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import {
    LEAD_ENRICHMENT_SUMMARY_MODEL,
    leadEnrichmentModelForProvider,
} from '../constants/lead-enrichment-ai.constants';
import {
    buildGoogleEnrichmentSummaryUserPrompt,
    buildLeadAiResearchPrompt,
    buildLinkedInEnrichmentSummaryUserPrompt,
    buildWebsiteEnrichmentSummaryUserPrompt,
    GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    LEAD_ENRICHMENT_SYSTEM_PROMPT,
    LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
    leadHasAiResearchSeed,
} from '../constants/ai-config';
import { EnrichmentHistoryTarget } from '@/modules/enrichment/interfaces/enrichment-target.interface';
import {
    buildGoogleDeterministicSummary,
    buildLinkedInDeterministicSummary,
    buildWebsiteDeterministicSummary,
    extractLinkedInDataFromEnrichmentPayload,
    googleSearchPayloadToContext,
    linkedInPlainForAiContext,
    normalizeWebsiteUrl,
    summarizeLinkedInPlain,
    websiteEnrichmentForAiContext,
} from './enrichment-data.utils';
import { LeadEnrichmentSourceResult } from '../interfaces/lead-enrichment-execution.interface';
import { LeadEnrichmentSummaryService } from '../services/lead-enrichment-summary.service';

@Injectable()
export class LeadAiService {
    private readonly logger = new Logger(LeadAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly aiConfig: AiConfig,
        private readonly websiteCrawler: WebsiteContentCrawlerAdapter,
        private readonly summaryService: LeadEnrichmentSummaryService,
    ) {}

    async enrichLead(lead: Lead): Promise<string | null> {
        return this.enrichWithAiFromWebsite(lead, {});
    }

    async enrichWithAiFromWebsite(
        lead: Lead,
        opts: {
            force?: boolean;
            prefetchedPageText?: string | null;
            linkedinProfileExcerpt?: string | null;
        },
    ): Promise<string | null> {
        if (!opts.force) {
            const existing = await this.prisma.leadEnrichment.findFirst({
                where: { lead_uuid: lead.uuid, source: EnrichmentSource.AI },
            });
            if (existing) {
                return existing.summary ?? null;
            }
        }
        const result = await this.buildAiEnrichmentResult(lead, opts);
        if (!result) {
            return null;
        }
        await this.prisma.leadEnrichment.create({
            data: {
                lead_uuid: lead.uuid,
                source: result.source,
                source_url: result.source_url,
                summary: result.summary,
                payload: result.payload,
                cost_usd: result.cost_usd ?? null,
                input_tokens: result.input_tokens ?? null,
                output_tokens: result.output_tokens ?? null,
                metadata: {
                    status: 'success',
                    ...(result.metadata && typeof result.metadata === 'object' && !Array.isArray(result.metadata)
                        ? result.metadata
                        : {}),
                } as Prisma.InputJsonValue,
            },
        });
        await this.summaryService.regenerate(lead.uuid);
        return result.summary;
    }

    async summarizeLinkedInEnrichment(
        plain: Record<string, unknown>,
        subtype: 'profile' | 'company',
    ): Promise<{
        summary: string;
        cost_usd: number | null;
        input_tokens: number | null;
        output_tokens: number | null;
    }> {
        const fallback =
            buildLinkedInDeterministicSummary(plain, subtype).trim() ||
            summarizeLinkedInPlain(plain).trim() ||
            '(LinkedIn)';
        if (!this.aiConfig.isOpenAiConfigured()) {
            return {
                summary: fallback,
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            };
        }
        try {
            const context = linkedInPlainForAiContext(plain, subtype);
            const { response, usage } = await this.aiService.generateText({
                provider: AiProviders.openai,
                model: LEAD_ENRICHMENT_SUMMARY_MODEL,
                prompt: buildLinkedInEnrichmentSummaryUserPrompt(context),
                system: LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
                maxTokens: 768,
            });
            const t = response?.trim();
            if (t) {
                return {
                    summary: t,
                    cost_usd: usage?.totalCost ?? null,
                    input_tokens: usage?.inputTokens ?? null,
                    output_tokens: usage?.outputTokens ?? null,
                };
            }
        } catch (error) {
            this.logger.warn(
                `LinkedIn enrichment summary failed: ${error instanceof Error ? error.message : error}`,
            );
        }
        return {
            summary: fallback,
            cost_usd: null,
            input_tokens: null,
            output_tokens: null,
        };
    }

    async summarizeWebsiteEnrichment(input: {
        url: string;
        title: string | null;
        textSample: string | null;
        markdownSample: string | null;
    }): Promise<{
        summary: string;
        cost_usd: number | null;
        input_tokens: number | null;
        output_tokens: number | null;
    }> {
        const fallback =
            buildWebsiteDeterministicSummary({
                url: input.url,
                title: input.title,
                textSample: input.textSample,
                markdownSample: input.markdownSample,
            }).trim() || input.url.trim();
        if (!this.aiConfig.isOpenAiConfigured()) {
            return {
                summary: fallback,
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            };
        }
        try {
            const context = websiteEnrichmentForAiContext({
                url: input.url,
                title: input.title,
                textSample: input.textSample,
                markdownSample: input.markdownSample,
            });
            const { response, usage } = await this.aiService.generateText({
                provider: AiProviders.openai,
                model: LEAD_ENRICHMENT_SUMMARY_MODEL,
                prompt: buildWebsiteEnrichmentSummaryUserPrompt(context),
                system: WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
                maxTokens: 768,
            });
            const t = response?.trim();
            if (t) {
                return {
                    summary: t,
                    cost_usd: usage?.totalCost ?? null,
                    input_tokens: usage?.inputTokens ?? null,
                    output_tokens: usage?.outputTokens ?? null,
                };
            }
        } catch (error) {
            this.logger.warn(
                `Website enrichment summary failed: ${error instanceof Error ? error.message : error}`,
            );
        }
        return {
            summary: fallback,
            cost_usd: null,
            input_tokens: null,
            output_tokens: null,
        };
    }

    async summarizeGoogleSearchEnrichment(input: {
        query: string;
        results: { title?: string; url?: string; snippet?: string }[];
    }): Promise<{
        summary: string;
        cost_usd: number | null;
        input_tokens: number | null;
        output_tokens: number | null;
    }> {
        const fallback =
            buildGoogleDeterministicSummary(input.query, input.results).trim() || '(Google Search)';
        if (!this.aiConfig.isOpenAiConfigured()) {
            return {
                summary: fallback,
                cost_usd: null,
                input_tokens: null,
                output_tokens: null,
            };
        }
        try {
            const resultsContext =
                googleSearchPayloadToContext({ results: input.results }) ?? '';
            const { response, usage } = await this.aiService.generateText({
                provider: AiProviders.openai,
                model: LEAD_ENRICHMENT_SUMMARY_MODEL,
                prompt: buildGoogleEnrichmentSummaryUserPrompt(input.query, resultsContext),
                system: GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
                maxTokens: 768,
            });
            const t = response?.trim();
            if (t) {
                return {
                    summary: t,
                    cost_usd: usage?.totalCost ?? null,
                    input_tokens: usage?.inputTokens ?? null,
                    output_tokens: usage?.outputTokens ?? null,
                };
            }
        } catch (error) {
            this.logger.warn(
                `Google search enrichment summary failed: ${error instanceof Error ? error.message : error}`,
            );
        }
        return {
            summary: fallback,
            cost_usd: null,
            input_tokens: null,
            output_tokens: null,
        };
    }

    async buildAiEnrichmentResult(
        lead: Lead,
        opts: {
            force?: boolean;
            prefetchedPageText?: string | null;
            linkedinProfileExcerpt?: string | null;
            historyTarget?: EnrichmentHistoryTarget;
        } = {},
    ): Promise<LeadEnrichmentSourceResult | null> {
        const historyTarget: EnrichmentHistoryTarget =
            opts.historyTarget ?? { kind: 'lead', uuid: lead.uuid };
        const provider = this.aiConfig.resolveLeadEnrichmentAiProvider();
        if (!this.aiConfig.isLeadEnrichmentAiConfigured(provider)) {
            const keyHint =
                provider === AiProviders.claude ? 'ANTHROPIC_API_KEY' : 'PERPLEXITY_API_KEY';
            this.logger.warn(`Lead ${lead.uuid}: ${keyHint} not set, skipping AI enrichment`);
            return null;
        }

        let websiteExcerpt = await this.resolveWebsiteExcerpt(lead, opts, historyTarget);

        const linkedinExcerpt = await this.resolveLinkedinExcerpt(historyTarget, opts);

        const googleExcerpt = await this.resolveGoogleSearchExcerpt(historyTarget);

        if (
            !leadHasAiResearchSeed(lead) &&
            !websiteExcerpt?.trim() &&
            !linkedinExcerpt?.trim() &&
            !googleExcerpt?.trim()
        ) {
            this.logger.warn(
                `Lead ${lead.uuid}: insufficient identity fields for AI research (need name, company, email, linkedin, website, or stored enrichment payloads)`,
            );
            return null;
        }

        const prompt = buildLeadAiResearchPrompt(
            lead,
            websiteExcerpt,
            linkedinExcerpt,
            googleExcerpt,
        );
        const model = leadEnrichmentModelForProvider(provider);

        const { response, usage } = await this.aiService.generateText({
            provider,
            model,
            prompt,
            system: LEAD_ENRICHMENT_SYSTEM_PROMPT,
            maxTokens: 1_024,
        });

        const sourceUrl = lead.website?.trim()
            ? normalizeWebsiteUrl(lead.website.trim())
            : null;

        this.logger.log(`Lead ${lead.uuid}: ${provider} enrichment (${usage?.totalTokens ?? '?'} tokens)`);

        return {
            source: EnrichmentSource.AI,
            source_url: sourceUrl,
            summary: response,
            payload: {
                provider,
                model,
                generated_at: new Date().toISOString(),
                website_context_used: Boolean(websiteExcerpt?.trim()),
                linkedin_context_used: Boolean(linkedinExcerpt?.trim()),
                google_search_context_used: Boolean(googleExcerpt?.trim()),
            },
            metadata: {
                model,
                provider,
                total_tokens: usage?.totalTokens,
            },
            cost_usd: usage?.totalCost ?? null,
            input_tokens: usage?.inputTokens ?? null,
            output_tokens: usage?.outputTokens ?? null,
        };
    }

    async fetchWebsiteText(url: string): Promise<string | null> {
        const normalized = url.startsWith('http') ? url : `https://${url}`;
        return this.getPageTextFromApifyCrawl(normalized);
    }

    private async resolveWebsiteExcerpt(
        lead: Lead,
        opts: { prefetchedPageText?: string | null },
        historyTarget: EnrichmentHistoryTarget,
    ): Promise<string | null> {
        if (opts.prefetchedPageText !== undefined) {
            const t = opts.prefetchedPageText?.trim();
            return t && t.length > 0 ? t : null;
        }
        const row = await this.findLatestEnrichmentRow(historyTarget, EnrichmentSource.WEBSITE);
        if (row?.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)) {
            const p = row.payload as Record<string, unknown>;
            const text = typeof p.text_sample === 'string' ? p.text_sample : '';
            const md = typeof p.markdown_sample === 'string' ? p.markdown_sample : '';
            const pick = text.trim().length > 0 ? text : md;
            if (pick.trim().length > 0) {
                return pick.trim();
            }
        }
        if (lead.website?.trim()) {
            const w = lead.website.trim();
            const url = w.startsWith('http') ? w : `https://${w}`;
            return this.getPageTextFromApifyCrawl(url);
        }
        return null;
    }

    private async resolveGoogleSearchExcerpt(
        historyTarget: EnrichmentHistoryTarget,
    ): Promise<string | null> {
        const row = await this.findLatestEnrichmentRow(historyTarget, EnrichmentSource.GOOGLE_SEARCH);
        return googleSearchPayloadToContext(row?.payload ?? null);
    }

    private async resolveLinkedinExcerpt(
        historyTarget: EnrichmentHistoryTarget,
        opts: { linkedinProfileExcerpt?: string | null },
    ): Promise<string | null> {
        if (opts.linkedinProfileExcerpt?.trim()) {
            return opts.linkedinProfileExcerpt.trim();
        }
        const row = await this.findLatestEnrichmentRow(historyTarget, EnrichmentSource.LINKEDIN);
        const plain = extractLinkedInDataFromEnrichmentPayload(row?.payload);
        if (!plain) {
            return null;
        }
        const meta = row?.metadata as Record<string, unknown> | null;
        const subtype = meta?.subtype === 'company' ? 'company' : 'profile';
        return linkedInPlainForAiContext(plain, subtype);
    }

    private async findLatestEnrichmentRow(
        historyTarget: EnrichmentHistoryTarget,
        source: EnrichmentSource,
    ) {
        if (historyTarget.kind === 'lead') {
            return this.prisma.leadEnrichment.findFirst({
                where: { lead_uuid: historyTarget.uuid, source },
                orderBy: { created_at: 'desc' },
            });
        }
        return this.prisma.contactEnrichment.findFirst({
            where: { contact_uuid: historyTarget.uuid, source },
            orderBy: { created_at: 'desc' },
        });
    }

    private async getPageTextFromApifyCrawl(url: string): Promise<string | null> {
        try {
            const page = await this.websiteCrawler.crawlSinglePage(url);
            if (!page) {
                this.logger.warn(`Apify crawl returned no page for ${url}`);
                return null;
            }
            return plainTextFromCrawledPage(page);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`Apify crawl failed for ${url}: ${message}`);
            return null;
        }
    }
}
