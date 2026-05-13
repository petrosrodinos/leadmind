import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Channel, Contact, Filter, Lead, MsgStatus, OutreachMessage } from '@/generated/prisma';
import { AiDraftMessageDto } from '../dto/ai-draft-message.dto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
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

@Injectable()
export class ContactAiService {
    private readonly logger = new Logger(ContactAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
        private readonly elasticsearchService: ElasticsearchService,
    ) { }

    async scoreContact(contact: Contact, lead: Lead, filter: Filter): Promise<number> {
        if (contact.score != null) {
            return contact.score;
        }

        if (!filter.scoring_instructions) {
            this.logger.warn(`Contact ${contact.uuid}: filter has no scoring_instructions, skipping score`);
            return 0;
        }

        const { response, usage } = await this.aiService.generateObjectWithSchema<ContactAiScoreResult>({
            provider: AiProviders.openai,
            model: AiModels.openai.gpt4oMini,
            schema: CONTACT_AI_SCORE_SCHEMA,
            prompt: buildScorePrompt(contact, lead, filter.scoring_instructions),
            system: AiScoringSystemPrompt,
        });

        await this.prisma.contact.update({
            where: { uuid: contact.uuid },
            data: { score: response.score },
        });

        const fresh = await this.prisma.contact.findUnique({
            where: { uuid: contact.uuid },
            include: { lead: true, tags: true },
        });
        if (fresh) {
            await this.elasticsearchService.indexContact(fresh);
        }

        this.logger.log(
            `Contact ${contact.uuid}: scored ${response.score}/10 (${usage.totalTokens} tokens, $${usage.totalCost.toFixed(5)})`,
        );

        return response.score;
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
