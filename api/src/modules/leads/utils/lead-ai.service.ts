import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Readable } from 'stream';
import { Lead, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { ENRICH_PROMPT, HOMEPAGE_FETCH_TIMEOUT_MS, MAX_HTML_BYTES, MAX_TEXT_CHARS } from '../constants/ai-config';



@Injectable()
export class LeadAiService {
    private readonly logger = new Logger(LeadAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) { }

    /**
     * Enrich a Lead with a public, AI-generated website summary.
     * - Skips if `lead.enrichment_data` is already set (idempotent).
     * - Returns null if `lead.website` is missing or fetch fails.
     */
    async enrichLead(lead: Lead): Promise<object | null> {
        if (lead.enrichment_data) {
            return lead.enrichment_data as object;
        }

        if (!lead.website) {
            return null;
        }

        const page_text = await this.fetchAndExtractText(lead.website);
        if (!page_text) {
            this.logger.warn(`Lead ${lead.uuid}: could not fetch/extract content from ${lead.website}`);
            return null;
        }

        const truncated = page_text.slice(0, MAX_TEXT_CHARS);

        const { response, usage } = await this.aiService.generateText({
            provider: AiProviders.openai,
            model: AiModels.openai.gpt4oMini,
            prompt: ENRICH_PROMPT(lead.website, truncated),
            system: 'You are a B2B research assistant producing concise company summaries from website content.',
        });

        const enrichment_data = {
            summary: response,
            source_url: lead.website,
            generated_at: new Date().toISOString(),
            cost_usd: usage?.totalCost,
            input_tokens: usage?.inputTokens,
            output_tokens: usage?.outputTokens,
        };

        await this.prisma.lead.update({
            where: { uuid: lead.uuid },
            data: { enrichment_data: enrichment_data as Prisma.InputJsonValue },
        });

        this.logger.log(`Lead ${lead.uuid}: enrichment generated (${usage?.totalTokens ?? '?'} tokens)`);

        return enrichment_data;
    }

    private async fetchAndExtractText(url: string): Promise<string | null> {
        try {
            const res = await axios.get(url, {
                timeout: HOMEPAGE_FETCH_TIMEOUT_MS,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadFinderBot/1.0)' },
                responseType: 'stream',
                validateStatus: () => true,
            });
            if (res.status < 200 || res.status >= 300) {
                this.logger.warn(`Fetch ${url} returned ${res.status}`);
                return null;
            }

            const chunks: Buffer[] = [];
            let received = 0;
            const stream = res.data as Readable;
            await new Promise<void>((resolve, reject) => {
                stream.on('data', (chunk: Buffer) => {
                    const dataChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    const remaining = MAX_HTML_BYTES - received;
                    if (remaining <= 0) {
                        stream.destroy();
                        return;
                    }
                    if (dataChunk.length > remaining) {
                        chunks.push(dataChunk.subarray(0, remaining));
                        received += remaining;
                        stream.destroy();
                        return;
                    }
                    chunks.push(dataChunk);
                    received += dataChunk.length;
                });
                stream.on('end', () => resolve());
                stream.on('close', () => resolve());
                stream.on('error', (error) => reject(error));
            });

            const html = Buffer.concat(chunks).toString('utf8');

            const $ = cheerio.load(html);
            $('script, style, noscript, iframe, svg, nav, footer, header').remove();
            const text = $('body').text().replace(/\s+/g, ' ').trim();

            return text || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.warn(`Fetch ${url} failed: ${message}`);
            return null;
        }
    }
}
