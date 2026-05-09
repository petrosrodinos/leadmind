import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Lead } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiConfig } from '@/integrations/ai/utils/ai.config';
import { AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import { leadEnrichmentModelForProvider } from '../constants/lead-enrichment-ai.constants';
import {
    buildLeadAiResearchPrompt,
    CLAUDE_LEAD_SYSTEM_PROMPT,
    leadHasAiResearchSeed,
    PERPLEXITY_LEAD_SYSTEM_PROMPT,
} from '../constants/ai-config';
import { recomputeLeadEnrichmentSummary } from './lead-enrichment-summary.utils';

@Injectable()
export class LeadAiService {
    private readonly logger = new Logger(LeadAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly aiConfig: AiConfig,
        private readonly websiteCrawler: WebsiteContentCrawlerAdapter,
    ) {}

    async enrichLead(lead: Lead): Promise<string | null> {
        return this.enrichWithAiFromWebsite(lead, {});
    }

    async enrichWithAiFromWebsite(
        lead: Lead,
        opts: { force?: boolean; prefetchedPageText?: string | null },
    ): Promise<string | null> {
        if (!opts.force) {
            const existing = await this.prisma.leadEnrichment.findFirst({
                where: { lead_uuid: lead.uuid, source: EnrichmentSource.AI },
            });
            if (existing) {
                return existing.summary ?? null;
            }
        }

        const provider = this.aiConfig.resolveLeadEnrichmentAiProvider();
        if (!this.aiConfig.isLeadEnrichmentAiConfigured(provider)) {
            const keyHint =
                provider === AiProviders.claude ? 'ANTHROPIC_API_KEY' : 'PERPLEXITY_API_KEY';
            this.logger.warn(`Lead ${lead.uuid}: ${keyHint} not set, skipping AI enrichment`);
            return null;
        }

        if (!leadHasAiResearchSeed(lead)) {
            this.logger.warn(
                `Lead ${lead.uuid}: insufficient identity fields for AI research (need name, company, email, linkedin, or website)`,
            );
            return null;
        }

        let websiteExcerpt: string | null = null;
        if (opts.prefetchedPageText != null && opts.prefetchedPageText !== undefined) {
            websiteExcerpt = opts.prefetchedPageText;
        } else if (lead.website?.trim()) {
            const w = lead.website.trim();
            const url = w.startsWith('http') ? w : `https://${w}`;
            websiteExcerpt = await this.getPageTextFromApifyCrawl(url);
        }

        const prompt = buildLeadAiResearchPrompt(lead, websiteExcerpt, provider);
        const model = leadEnrichmentModelForProvider(provider);
        const system =
            provider === AiProviders.claude ? CLAUDE_LEAD_SYSTEM_PROMPT : PERPLEXITY_LEAD_SYSTEM_PROMPT;

        const { response, usage } = await this.aiService.generateText({
            provider,
            model,
            prompt,
            system,
            maxTokens: 1_024,
        });

        const fallbackSource =
            provider === AiProviders.claude ? 'claude:lead-research' : 'perplexity:lead-research';
        const sourceUrl =
            lead.linkedin_url?.trim() ||
            (lead.website?.trim()
                ? lead.website.trim().startsWith('http')
                    ? lead.website.trim()
                    : `https://${lead.website.trim()}`
                : null) ||
            fallbackSource;

        await this.prisma.$transaction(async (tx) => {
            await tx.leadEnrichment.create({
                data: {
                    lead_uuid: lead.uuid,
                    source: EnrichmentSource.AI,
                    source_url: sourceUrl,
                    summary: response,
                    payload: {
                        provider,
                        model,
                        generated_at: new Date().toISOString(),
                        website_context_used: Boolean(websiteExcerpt?.trim()),
                    },
                    cost_usd: usage?.totalCost ?? null,
                    input_tokens: usage?.inputTokens ?? null,
                    output_tokens: usage?.outputTokens ?? null,
                    metadata: {
                        model,
                        provider,
                        total_tokens: usage?.totalTokens,
                    },
                },
            });
            await recomputeLeadEnrichmentSummary(tx, lead.uuid);
        });

        this.logger.log(`Lead ${lead.uuid}: ${provider} enrichment (${usage?.totalTokens ?? '?'} tokens)`);

        return response;
    }

    async fetchWebsiteText(url: string): Promise<string | null> {
        const normalized = url.startsWith('http') ? url : `https://${url}`;
        return this.getPageTextFromApifyCrawl(normalized);
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
