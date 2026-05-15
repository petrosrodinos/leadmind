import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Channel, Contact, Filter, Lead, MsgStatus, OpenAiBatchJobType, OpenAiBatchStatus, OutreachMessage, Prisma } from '@/generated/prisma';
import { AiDraftMessageDto } from '../dto/ai-draft-message.dto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { OpenAiBatchService } from '@/integrations/ai/services/openai-batch.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { OpenAiBatchRequest } from '@/integrations/ai/interfaces/openai-batch.interface';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';
import {
    AiScoringSystemPrompt,
    buildEmailPrompt,
    buildLinkedInPrompt,
    buildScorePrompt,
    buildSmsPrompt,
} from '../constants/contact-ai-prompts';
import { generateWithCampaignPrompt, parseEmailDraft } from '@/shared/utils/outreach-ai-generate.util';
import { CONTACT_AI_SCORE_SCHEMA, type ContactAiScoreResult } from '../schemas/contact-ai-score.schema';
import { sanitizeEmailHtml } from '@/shared/utils/sanitize-html.util';

const filterForScoreInclude = {
    filter_scoring_instructions: { include: { scoring_instruction: true } },
} satisfies Prisma.FilterInclude;

export type FilterForScore = Prisma.FilterGetPayload<{ include: typeof filterForScoreInclude }>;

export interface ContactBatchScoringItem {
    contact_uuid: string;
    instruction_uuids: string[];
}

@Injectable()
export class ContactAiService {
    private readonly logger = new Logger(ContactAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly openAiBatchService: OpenAiBatchService,
        private readonly elasticsearchService: ElasticsearchService,
    ) { }

    async scoreContact(
        contact: Contact,
        lead: Lead,
        filter: FilterForScore,
        opts?: { onlyInstructionUuids?: string[] },
    ): Promise<void> {
        const linksAll = filter.filter_scoring_instructions ?? [];
        const only = opts?.onlyInstructionUuids?.filter(Boolean);
        const links =
            only && only.length > 0
                ? linksAll.filter((l) => only.includes(l.scoring_instruction.uuid))
                : linksAll;
        if (links.length === 0) {
            this.logger.warn(`Contact ${contact.uuid}: filter has no scoring instructions, skipping score`);
            return;
        }

        const existingRows = await this.prisma.contactScore.findMany({
            where: { contact_uuid: contact.uuid },
            select: { scoring_instruction_uuid: true },
        });
        const done = new Set(existingRows.map((r) => r.scoring_instruction_uuid));

        for (const link of links) {
            const instr = link.scoring_instruction;
            if (done.has(instr.uuid)) continue;

            const { response, usage } = await this.aiService.generateObjectWithSchema<ContactAiScoreResult>({
                provider: AiProviders.openai,
                model: AiModels.openai.gpt4oMini,
                schema: CONTACT_AI_SCORE_SCHEMA,
                prompt: buildScorePrompt(contact, lead, instr.instructions),
                system: AiScoringSystemPrompt,
            });

            await this.prisma.contactScore.upsert({
                where: {
                    contact_uuid_scoring_instruction_uuid: {
                        contact_uuid: contact.uuid,
                        scoring_instruction_uuid: instr.uuid,
                    },
                },
                create: {
                    contact_uuid: contact.uuid,
                    scoring_instruction_uuid: instr.uuid,
                    score: response.score,
                },
                update: { score: response.score },
            });
            done.add(instr.uuid);

            this.logger.log(
                `Contact ${contact.uuid} / ${instr.uuid}: scored ${response.score}/10 (${usage.totalTokens} tokens, $${usage.totalCost.toFixed(5)})`,
            );
        }

        const fresh = await this.prisma.contact.findUnique({
            where: { uuid: contact.uuid },
            include: {
                lead: true,
                tags: true,
                contact_scores: {
                    include: { scoring_instruction: { select: { uuid: true, name: true } } },
                },
            },
        });
        if (fresh) {
            await this.elasticsearchService.indexContact(fresh);
        }
    }

    async submitBatchScore(
        user_uuid: string,
        plan: ContactBatchScoringItem[],
    ): Promise<{ batch_id: string; queued: number }> {
        const allInstrUuids = [...new Set(plan.flatMap((p) => p.instruction_uuids))];
        const contactUuids = plan.map((p) => p.contact_uuid);

        const [instructions, contacts, existingScores] = await Promise.all([
            this.prisma.scoringInstruction.findMany({
                where: { uuid: { in: allInstrUuids } },
                select: { uuid: true, instructions: true },
            }),
            this.prisma.contact.findMany({
                where: { uuid: { in: contactUuids } },
                include: { lead: true },
            }),
            this.prisma.contactScore.findMany({
                where: { contact_uuid: { in: contactUuids } },
                select: { contact_uuid: true, scoring_instruction_uuid: true },
            }),
        ]);

        const instrMap = new Map(instructions.map((i) => [i.uuid, i.instructions]));
        const contactMap = new Map(contacts.map((c) => [c.uuid, c]));
        const scoredPairs = new Set(
            existingScores.map((s) => `${s.contact_uuid}|${s.scoring_instruction_uuid}`),
        );

        const requests: OpenAiBatchRequest[] = [];
        for (const item of plan) {
            const contact = contactMap.get(item.contact_uuid);
            if (!contact) continue;

            for (const instrUuid of item.instruction_uuids) {
                if (scoredPairs.has(`${item.contact_uuid}|${instrUuid}`)) continue;
                const instrText = instrMap.get(instrUuid);
                if (!instrText) continue;

                requests.push({
                    custom_id: `contact_score|${item.contact_uuid}|${instrUuid}`,
                    model: AiModels.openai.gpt4oMini,
                    messages: [
                        { role: 'system', content: AiScoringSystemPrompt },
                        { role: 'user', content: buildScorePrompt(contact, contact.lead, instrText) },
                    ],
                    response_format: { type: 'json_object' },
                });
            }
        }

        if (requests.length === 0) {
            throw new BadRequestException('All selected contacts are already scored for the chosen rules.');
        }

        const result = await this.openAiBatchService.createBatch(requests);

        await this.prisma.openAiBatchJob.create({
            data: {
                batch_id: result.batch_id,
                user_uuid,
                type: OpenAiBatchJobType.CONTACT_SCORE,
                status: OpenAiBatchStatus.IN_PROGRESS,
                total_requests: requests.length,
                input_file_id: result.input_file_id,
                expires_at: result.expires_at,
            },
        });

        this.logger.log(`Batch scoring submitted: ${result.batch_id} (${requests.length} requests)`);
        return { batch_id: result.batch_id, queued: requests.length };
    }

    async processBatchScoreResults(batchId: string): Promise<void> {
        const job = await this.prisma.openAiBatchJob.findUnique({ where: { batch_id: batchId } });
        if (!job) {
            this.logger.warn(`No OpenAiBatchJob found for batch_id: ${batchId}`);
            return;
        }

        const batchStatus = await this.openAiBatchService.getBatchStatus(batchId);
        if (!batchStatus.output_file_id) {
            this.logger.warn(`Batch ${batchId} has no output file yet`);
            return;
        }

        const results = await this.openAiBatchService.getBatchResults(batchStatus.output_file_id);
        const updatedContactUuids = new Set<string>();

        for (const result of results) {
            if (!result.content || result.error) {
                this.logger.warn(`Batch result ${result.custom_id} failed: ${result.error}`);
                continue;
            }

            const parts = result.custom_id.split('|');
            if (parts.length !== 3 || parts[0] !== 'contact_score') continue;
            const [, contact_uuid, scoring_instruction_uuid] = parts;

            try {
                const parsed = JSON.parse(result.content);
                const score = Number(parsed.score);
                if (!Number.isFinite(score)) continue;

                await this.prisma.contactScore.upsert({
                    where: { contact_uuid_scoring_instruction_uuid: { contact_uuid, scoring_instruction_uuid } },
                    create: { contact_uuid, scoring_instruction_uuid, score },
                    update: { score },
                });
                updatedContactUuids.add(contact_uuid);
            } catch {
                this.logger.warn(`Failed to parse batch result for ${result.custom_id}`);
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

        for (const contact_uuid of updatedContactUuids) {
            const fresh = await this.prisma.contact.findUnique({
                where: { uuid: contact_uuid },
                include: {
                    lead: true,
                    tags: true,
                    contact_scores: {
                        include: { scoring_instruction: { select: { uuid: true, name: true } } },
                    },
                },
            });
            if (fresh) {
                await this.elasticsearchService.indexContact(fresh);
            }
        }

        this.logger.log(`Batch ${batchId} processed: ${updatedContactUuids.size} contacts updated`);
    }

    async draftOutreachMessages(
        contact: Contact,
        lead: Lead,
        filter: Filter,
    ): Promise<OutreachMessage[]> {
        if (!filter.outreach_instructions || filter.channels.length === 0) {
            return [];
        }

        const sender_business_description = await this.resolveSenderBusinessDescription(
            contact.user_uuid,
        );

        const created: OutreachMessage[] = [];

        for (const channel of filter.channels) {
            const existing = await this.prisma.outreachMessage.findFirst({
                where: {
                    contact_uuid: contact.uuid,
                    channel,
                    status: MsgStatus.PENDING,
                },
            });
            if (existing) {
                this.logger.debug(
                    `Contact ${contact.uuid}/${channel}: PENDING draft already exists, skipping`,
                );
                continue;
            }

            try {
                const draft = await this.draftForChannel(
                    channel,
                    contact,
                    lead,
                    filter.outreach_instructions,
                    undefined,
                    sender_business_description,
                );

                const content =
                    channel === Channel.EMAIL ? sanitizeEmailHtml(draft.content) : draft.content;

                const message = await this.prisma.outreachMessage.create({
                    data: {
                        user_uuid: contact.user_uuid,
                        contact_uuid: contact.uuid,
                        channel,
                        subject: draft.subject ?? null,
                        content,
                        status: MsgStatus.PENDING,
                    },
                });

                created.push(message);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Contact ${contact.uuid}/${channel}: draft failed: ${message}`);
            }
        }

        return created;
    }

    async draftBulkMessages(
        user_uuid: string,
        contacts: Array<Contact & { lead: Lead }>,
        channel: Channel,
        prompt: string,
        language?: string,
        campaign_uuid?: string,
    ): Promise<{ generated: number; skipped: number; failed: number }> {
        const sender_business_description = await this.resolveSenderBusinessDescription(user_uuid);
        let generated = 0;
        let skipped = 0;
        let failed = 0;

        for (const item of contacts) {
            const idempotencyKey = campaign_uuid
                ? `campaign:${campaign_uuid}:${item.uuid}:${channel}`
                : undefined;

            const existing = await this.prisma.outreachMessage.findFirst({
                where: {
                    contact_uuid: item.uuid,
                    channel,
                    status: MsgStatus.PENDING,
                    ...(campaign_uuid ? { campaign_uuid } : {}),
                },
            });
            if (existing) {
                skipped++;
                this.logger.debug(`Bulk draft ${item.uuid}/${channel}: PENDING draft exists, skipping`);
                continue;
            }

            try {
                const draft = await this.draftForChannel(
                    channel,
                    item as Contact,
                    item.lead,
                    prompt,
                    language,
                    sender_business_description,
                );
                const content = channel === Channel.EMAIL ? sanitizeEmailHtml(draft.content) : draft.content;
                await this.prisma.outreachMessage.create({
                    data: {
                        user_uuid,
                        contact_uuid: item.uuid,
                        channel,
                        subject: draft.subject ?? null,
                        content,
                        status: MsgStatus.PENDING,
                        ...(campaign_uuid ? { campaign_uuid, idempotency_key: idempotencyKey } : {}),
                    },
                });
                generated++;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Bulk draft ${item.uuid}/${channel}: failed: ${message}`);
                failed++;
            }
        }

        this.logger.log(`Bulk draft complete: ${generated} generated, ${skipped} skipped, ${failed} failed`);
        return { generated, skipped, failed };
    }

    async draftAdHocMessage(
        user_uuid: string,
        dto: AiDraftMessageDto,
    ): Promise<{ subject: string | null; content: string }> {
        const contact = await this.prisma.contact.findFirst({
            where: { uuid: dto.contact_uuid, user_uuid },
            include: { lead: true },
        });
        if (!contact) {
            throw new ForbiddenException(`Contact ${dto.contact_uuid} not found`);
        }

        const sender_business_description = await this.resolveSenderBusinessDescription(user_uuid);
        const action = dto.action ?? 'generate';

        if (action !== 'generate') {
            return generateWithCampaignPrompt(this.aiService, dto.channel, action, {
                sender_business_description,
                user_prompt: dto.prompt,
                current_subject: dto.current_subject,
                current_content: dto.current_content,
                language: dto.language,
            });
        }

        const draft = await this.draftForChannel(
            dto.channel,
            contact,
            contact.lead,
            dto.prompt ?? '',
            dto.language,
            sender_business_description,
        );
        const content =
            dto.channel === Channel.EMAIL ? sanitizeEmailHtml(draft.content) : draft.content;

        return { subject: draft.subject, content };
    }

    private async resolveSenderBusinessDescription(user_uuid: string): Promise<string | undefined> {
        const profile = await this.prisma.senderProfile.findFirst({
            where: { user_uuid, is_default: true },
            select: { business_description: true },
        });
        if (profile?.business_description) return profile.business_description;
        const fallback = await this.prisma.senderProfile.findFirst({
            where: { user_uuid },
            orderBy: { created_at: 'desc' },
            select: { business_description: true },
        });
        return fallback?.business_description ?? undefined;
    }

    private async draftForChannel(
        channel: Channel,
        contact: Contact,
        lead: Lead,
        outreach_instructions: string,
        language?: string,
        sender_business_description?: string,
    ): Promise<{ subject: string | null; content: string }> {
        const prompt = this.promptForChannel(
            channel,
            contact,
            lead,
            outreach_instructions,
            language,
            sender_business_description,
        );

        const { response } = await this.aiService.generateText({
            provider: AiProviders.openai,
            model: AiModels.openai.gpt4o,
            prompt,
            system: 'You are an expert B2B outreach copywriter. Produce drafts ready for human review.',
        });

        if (channel === Channel.EMAIL) {
            return parseEmailDraft(response);
        }
        return { subject: null, content: response.trim() };
    }

    private promptForChannel(
        channel: Channel,
        contact: Contact,
        lead: Lead,
        outreach_instructions: string,
        language?: string,
        sender_business_description?: string,
    ): string {
        switch (channel) {
            case Channel.EMAIL:
                return buildEmailPrompt(contact, lead, outreach_instructions, language, sender_business_description);
            case Channel.SMS:
                return buildSmsPrompt(contact, lead, outreach_instructions, language, sender_business_description);
            case Channel.LINKEDIN:
                return buildLinkedInPrompt(contact, lead, outreach_instructions, language, sender_business_description);
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
    }

}
