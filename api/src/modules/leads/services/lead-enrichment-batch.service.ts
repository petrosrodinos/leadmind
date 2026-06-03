import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
    EnrichmentSource,
    Lead,
    OpenAiBatchJobType,
    OpenAiBatchStatus,
    Prisma,
} from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { OpenAiBatchRequest, OpenAiBatchResult } from '@/integrations/ai/interfaces/openai-batch.interface';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import {
    buildGoogleDeterministicSummary,
    buildLinkedInDeterministicSummary,
    buildWebsiteDeterministicSummary,
    normalizeWebsiteUrl,
    summarizeLinkedInPlain,
} from '../utils/enrichment-data.utils';
import { resolveLeadEnrichmentSources } from '../utils/enrichment-sources.utils';
import { LeadEnrichmentOrchestrator } from './lead-enrichment.orchestrator';
import { LeadEnrichmentSummaryService } from './lead-enrichment-summary.service';
import {
    buildLeadEnrichmentSummaryPrompt,
    leadEnrichmentSummaryAiResponseSchema,
    LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT,
} from '../constants/ai-config';
import {
    coerceLeadEnrichmentMetadata,
    formatLeadEnrichmentRowsForSummary,
    buildDeterministicLeadEnrichmentSummary,
} from '../utils/lead-enrichment-summary.utils';
import type {
    LeadEnrichmentBatchContext,
    LeadEnrichmentBatchLeadStaging,
    LeadEnrichmentBatchPhase,
} from '../interfaces/lead-enrichment-batch.interface';
import { AiConfig } from '@/integrations/ai/utils/ai.config';

@Injectable()
export class LeadEnrichmentBatchService {
    private readonly logger = new Logger(LeadEnrichmentBatchService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly orchestrator: LeadEnrichmentOrchestrator,
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly summaryService: LeadEnrichmentSummaryService,
        private readonly aiConfig: AiConfig,
    ) {}

    async findBatchJob(batchId: string) {
        return this.prisma.openAiBatchJob.findUnique({ where: { batch_id: batchId } });
    }

    async prepareAndSubmitBulk(
        user_uuid: string,
        leadUuids: string[],
        sources?: EnrichmentSource[],
    ): Promise<{ batch_id: string; queued: number; gemi_only?: boolean }> {
        const enrichment_sources = resolveLeadEnrichmentSources(sources);
        const leads = await this.prisma.lead.findMany({
            where: { uuid: { in: leadUuids } },
        });
        const leadMap = new Map(leads.map((l) => [l.uuid, l]));

        const requests: OpenAiBatchRequest[] = [];
        const staging: Record<string, LeadEnrichmentBatchLeadStaging> = {};
        const processedLeadUuids: string[] = [];
        const gemiOnlyLeadUuids: string[] = [];

        for (const uuid of leadUuids) {
            const lead = leadMap.get(uuid);
            if (!lead) continue;

            const { requests: leadRequests, staging: leadStaging, gemiPersisted } =
                await this.orchestrator.prepareLeadBatchRequests(lead, enrichment_sources, true);

            if (leadRequests.length > 0) {
                requests.push(...leadRequests);
                staging[uuid] = leadStaging;
                processedLeadUuids.push(uuid);
            } else if (gemiPersisted) {
                gemiOnlyLeadUuids.push(uuid);
            } else if (Object.keys(leadStaging).length > 0) {
                staging[uuid] = leadStaging;
            }
        }

        if (requests.length === 0) {
            if (gemiOnlyLeadUuids.length > 0) {
                for (const leadUuid of gemiOnlyLeadUuids) {
                    await this.summaryService.regenerate(leadUuid);
                }
                return { batch_id: '', queued: 0, gemi_only: true };
            }
            throw new BadRequestException(
                'No OpenAI batch requests to submit. Sources may already be enriched or scrapers returned no data.',
            );
        }

        const result = await this.openAiBatchService.createBatch(requests);

        const context: LeadEnrichmentBatchContext = {
            phase: 'source_summaries',
            user_uuid,
            lead_uuids: processedLeadUuids.length ? processedLeadUuids : leadUuids,
            sources: enrichment_sources,
            staging,
        };

        await this.prisma.openAiBatchJob.create({
            data: {
                batch_id: result.batch_id,
                user_uuid,
                type: OpenAiBatchJobType.LEAD_ENRICH,
                status: OpenAiBatchStatus.IN_PROGRESS,
                total_requests: requests.length,
                input_file_id: result.input_file_id,
                expires_at: result.expires_at,
                context: context as unknown as Prisma.InputJsonValue,
            },
        });

        this.logger.log(
            `Lead enrichment batch submitted: ${result.batch_id} (${requests.length} requests, ${leadUuids.length} leads)`,
        );

        return { batch_id: result.batch_id, queued: requests.length };
    }

    async processBatchResults(
        batchId: string,
        prefetchedStatus?: {
            output_file_id: string | null;
            error_file_id: string | null;
            completed_requests: number;
            failed_requests: number;
            total_requests: number;
        },
    ): Promise<void> {
        const job = await this.prisma.openAiBatchJob.findUnique({ where: { batch_id: batchId } });
        if (!job) {
            this.logger.warn(`No OpenAiBatchJob for batch_id: ${batchId}`);
            return;
        }

        if (job.status === OpenAiBatchStatus.COMPLETED) {
            return;
        }

        const batchStatus = prefetchedStatus ?? (await this.openAiBatchService.waitForBatchReady(batchId));
        if (!batchStatus.output_file_id) {
            this.logger.warn(`Batch ${batchId} has no output file yet (status may still be finalizing)`);
            return;
        }

        const results = await this.openAiBatchService.getBatchResults(batchStatus.output_file_id);
        const storedContext = job.context as unknown as LeadEnrichmentBatchContext | null;
        const phase = storedContext?.phase ?? this.inferBatchPhase(results);

        if (phase === 'combined_summaries') {
            await this.processCombinedBatchResults(batchId, job.user_uuid, storedContext, batchStatus, results);
            return;
        }

        const context: LeadEnrichmentBatchContext = storedContext ?? {
            phase: 'source_summaries',
            user_uuid: job.user_uuid,
            lead_uuids: [],
            sources: [],
            staging: {},
        };

        const leadsForCombined = new Set<string>();

        for (const result of results) {
            if (!result.content || result.error) {
                this.logger.warn(`Batch result ${result.custom_id} failed: ${result.error}`);
                continue;
            }

            const parts = result.custom_id.split('|');
            if (parts.length !== 3 || parts[0] !== 'lead_enrich') continue;
            const [, kind, lead_uuid] = parts;
            const leadStaging = context.staging[lead_uuid];
            const lead = await this.prisma.lead.findUnique({ where: { uuid: lead_uuid } });
            if (!lead) continue;

            try {
                const persisted = await this.persistSourceBatchResult(
                    lead,
                    kind,
                    result.content,
                    leadStaging,
                );
                if (persisted) {
                    leadsForCombined.add(lead_uuid);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                this.logger.warn(`Failed to persist batch result ${result.custom_id}: ${message}`);
            }
        }

        await this.prisma.openAiBatchJob.update({
            where: { batch_id: batchId },
            data: {
                status: OpenAiBatchStatus.COMPLETED,
                finished_at: new Date(),
                output_file_id: batchStatus.output_file_id,
                error_file_id: batchStatus.error_file_id,
                completed_requests: batchStatus.completed_requests,
                failed_requests: batchStatus.failed_requests,
                total_requests: batchStatus.total_requests,
            },
        });

        if (leadsForCombined.size > 0) {
            await this.submitCombinedSummaryBatch(
                job.user_uuid,
                [...leadsForCombined],
                context,
                batchId,
            );
        } else if (results.length > 0) {
            this.logger.warn(
                `Lead enrichment source batch ${batchId} produced ${results.length} results but none were persisted`,
            );
        }

        this.logger.log(`Lead enrichment source batch ${batchId} processed`);
    }

    private inferBatchPhase(results: OpenAiBatchResult[]): LeadEnrichmentBatchPhase {
        for (const result of results) {
            const parts = result.custom_id.split('|');
            if (parts.length === 3 && parts[0] === 'lead_enrich' && parts[1] === 'combined') {
                return 'combined_summaries';
            }
        }
        return 'source_summaries';
    }

    private async submitCombinedSummaryBatch(
        user_uuid: string,
        leadUuids: string[],
        parentContext: LeadEnrichmentBatchContext,
        parentBatchId: string,
    ): Promise<void> {
        if (!this.aiConfig.isOpenAiConfigured()) {
            for (const leadUuid of leadUuids) {
                await this.summaryService.regenerate(leadUuid);
            }
            return;
        }

        const requests: OpenAiBatchRequest[] = [];

        for (const leadUuid of leadUuids) {
            const lead = await this.prisma.lead.findUnique({ where: { uuid: leadUuid } });
            if (!lead) continue;

            const rows = await this.prisma.leadEnrichment.findMany({
                where: { lead_uuid: leadUuid },
                orderBy: { created_at: 'desc' },
            });
            if (!rows.length) continue;

            const sourceContext = formatLeadEnrichmentRowsForSummary(rows);
            const prompt = buildLeadEnrichmentSummaryPrompt(lead, sourceContext);

            requests.push({
                custom_id: `lead_enrich|combined|${leadUuid}`,
                model: AiModels.openai.gpt4oMini,
                messages: [
                    { role: 'system', content: LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
            });
        }

        if (requests.length === 0) {
            return;
        }

        const result = await this.openAiBatchService.createBatch(requests);
        const context: LeadEnrichmentBatchContext = {
            phase: 'combined_summaries',
            user_uuid,
            lead_uuids: leadUuids,
            sources: parentContext.sources,
            staging: {},
            parent_batch_id: parentBatchId,
        };

        await this.prisma.openAiBatchJob.create({
            data: {
                batch_id: result.batch_id,
                user_uuid,
                type: OpenAiBatchJobType.LEAD_ENRICH,
                status: OpenAiBatchStatus.IN_PROGRESS,
                total_requests: requests.length,
                input_file_id: result.input_file_id,
                expires_at: result.expires_at,
                context: context as unknown as Prisma.InputJsonValue,
            },
        });

        this.logger.log(
            `Lead combined summary batch submitted: ${result.batch_id} (${requests.length} requests)`,
        );
    }

    private async processCombinedBatchResults(
        batchId: string,
        user_uuid: string,
        context: LeadEnrichmentBatchContext | null,
        batchStatus: {
            output_file_id: string | null;
            error_file_id: string | null;
            completed_requests: number;
            failed_requests: number;
            total_requests: number;
        },
        prefetchedResults?: OpenAiBatchResult[],
    ): Promise<void> {
        const results =
            prefetchedResults ??
            (await this.openAiBatchService.getBatchResults(batchStatus.output_file_id!));

        for (const result of results) {
            if (!result.content || result.error) continue;

            const parts = result.custom_id.split('|');
            if (parts.length !== 3 || parts[0] !== 'lead_enrich' || parts[1] !== 'combined') {
                continue;
            }
            const lead_uuid = parts[2];

            const rows = await this.prisma.leadEnrichment.findMany({
                where: { lead_uuid },
                orderBy: { created_at: 'desc' },
            });
            const fallback = buildDeterministicLeadEnrichmentSummary(rows);

            try {
                const parsed = JSON.parse(result.content);
                const validated = leadEnrichmentSummaryAiResponseSchema.safeParse(parsed);
                const summary = validated.success
                    ? validated.data.summary?.trim() || fallback
                    : fallback;
                const metadata = validated.success
                    ? coerceLeadEnrichmentMetadata(validated.data.metadata)
                    : null;

                await this.prisma.lead.update({
                    where: { uuid: lead_uuid },
                    data: { enrichment_summary: summary, enrichment_metadata: metadata },
                });
            } catch {
                await this.prisma.lead.update({
                    where: { uuid: lead_uuid },
                    data: { enrichment_summary: fallback, enrichment_metadata: null },
                });
            }
        }

        await this.prisma.openAiBatchJob.update({
            where: { batch_id: batchId },
            data: {
                status: OpenAiBatchStatus.COMPLETED,
                finished_at: new Date(),
                output_file_id: batchStatus.output_file_id,
                error_file_id: batchStatus.error_file_id,
                completed_requests: batchStatus.completed_requests,
                failed_requests: batchStatus.failed_requests,
                total_requests: batchStatus.total_requests,
            },
        });

        this.logger.log(`Lead enrichment combined batch ${batchId} processed`);
    }

    private async persistSourceBatchResult(
        lead: Lead,
        kind: string,
        content: string,
        staging?: LeadEnrichmentBatchLeadStaging,
    ): Promise<boolean> {
        switch (kind) {
            case 'linkedin': {
                if (staging?.linkedin) {
                    const { url, subtype, plain } = staging.linkedin;
                    const summary =
                        content.trim() ||
                        buildLinkedInDeterministicSummary(plain, subtype).trim() ||
                        summarizeLinkedInPlain(plain).trim() ||
                        '(LinkedIn)';
                    await this.orchestrator.persistEnrichmentAttempt(
                        lead.uuid,
                        {
                            source: EnrichmentSource.LINKEDIN,
                            source_url: url,
                            summary,
                            payload: {
                                fetched_at: new Date().toISOString(),
                                data: plain,
                            } as Prisma.InputJsonValue,
                            metadata: { subtype, batch: true },
                            status: 'success',
                            lead_update: this.buildLeadUpdateFromLinkedIn(lead, plain, subtype),
                        },
                        { skipSummaryRegen: true },
                    );
                    return true;
                }
                if (!content.trim()) return false;
                await this.orchestrator.persistEnrichmentAttempt(
                    lead.uuid,
                    {
                        source: EnrichmentSource.LINKEDIN,
                        source_url: lead.linkedin_url,
                        summary: content.trim(),
                        payload: { fetched_at: new Date().toISOString(), batch: true, staging_missing: true },
                        metadata: { batch: true, staging_missing: true },
                        status: 'success',
                    },
                    { skipSummaryRegen: true },
                );
                return true;
            }
            case 'website': {
                if (staging?.website) {
                    const { url, title, textSample, markdownSample } = staging.website;
                    const summary =
                        content.trim() ||
                        buildWebsiteDeterministicSummary({
                            url,
                            title,
                            textSample,
                            markdownSample,
                        }).trim() ||
                        url;
                    await this.orchestrator.persistEnrichmentAttempt(
                        lead.uuid,
                        {
                            source: EnrichmentSource.WEBSITE,
                            source_url: url,
                            summary,
                            payload: {
                                fetched_at: new Date().toISOString(),
                                url,
                                title,
                                text_sample: textSample,
                                markdown_sample: markdownSample,
                            },
                            metadata: { batch: true },
                            status: 'success',
                        },
                        { skipSummaryRegen: true },
                    );
                    return true;
                }
                if (!content.trim()) return false;
                await this.orchestrator.persistEnrichmentAttempt(
                    lead.uuid,
                    {
                        source: EnrichmentSource.WEBSITE,
                        source_url: lead.website,
                        summary: content.trim(),
                        payload: { fetched_at: new Date().toISOString(), batch: true, staging_missing: true },
                        metadata: { batch: true, staging_missing: true },
                        status: 'success',
                    },
                    { skipSummaryRegen: true },
                );
                return true;
            }
            case 'google': {
                if (staging?.google) {
                    const { query, results } = staging.google;
                    const summary =
                        content.trim() ||
                        buildGoogleDeterministicSummary(query, results).trim() ||
                        '(Google Search)';
                    await this.orchestrator.persistEnrichmentAttempt(
                        lead.uuid,
                        {
                            source: EnrichmentSource.GOOGLE_SEARCH,
                            source_url: query,
                            summary,
                            payload: {
                                query,
                                fetched_at: new Date().toISOString(),
                                results,
                            },
                            metadata: { batch: true },
                            status: 'success',
                        },
                        { skipSummaryRegen: true },
                    );
                    return true;
                }
                if (!content.trim()) return false;
                await this.orchestrator.persistEnrichmentAttempt(
                    lead.uuid,
                    {
                        source: EnrichmentSource.GOOGLE_SEARCH,
                        source_url: lead.company ?? lead.name,
                        summary: content.trim(),
                        payload: { fetched_at: new Date().toISOString(), batch: true, staging_missing: true },
                        metadata: { batch: true, staging_missing: true },
                        status: 'success',
                    },
                    { skipSummaryRegen: true },
                );
                return true;
            }
            case 'ai': {
                const sourceUrl = lead.website?.trim()
                    ? normalizeWebsiteUrl(lead.website.trim())
                    : null;
                await this.orchestrator.persistEnrichmentAttempt(
                    lead.uuid,
                    {
                        source: EnrichmentSource.AI,
                        source_url: sourceUrl,
                        summary: content.trim(),
                        payload: {
                            provider: AiProviders.openai,
                            model: AiModels.openai.gpt4o,
                            generated_at: new Date().toISOString(),
                            website_context_used: Boolean(staging?.ai?.websiteExcerpt?.trim()),
                            linkedin_context_used: Boolean(staging?.ai?.linkedinExcerpt?.trim()),
                            google_search_context_used: Boolean(staging?.ai?.googleExcerpt?.trim()),
                            batch: true,
                        },
                        metadata: { model: AiModels.openai.gpt4o, provider: AiProviders.openai, batch: true },
                        status: 'success',
                    },
                    { skipSummaryRegen: true },
                );
                return true;
            }
            default:
                return false;
        }
    }

    private buildLeadUpdateFromLinkedIn(
        lead: Lead,
        plain: Record<string, unknown>,
        subtype: 'profile' | 'company',
    ): Prisma.LeadUpdateInput {
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
        return data;
    }
}
