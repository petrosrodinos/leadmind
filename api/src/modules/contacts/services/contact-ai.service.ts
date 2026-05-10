import { Injectable, Logger } from '@nestjs/common';
import { Channel, Contact, Filter, Lead, MsgStatus, OutreachMessage } from '@/generated/prisma';
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
import { CONTACT_AI_SCORE_SCHEMA, type ContactAiScoreResult } from '../schemas/contact-ai-score.schema';

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
                const draft = await this.draftForChannel(channel, contact, lead, filter.outreach_instructions);

                const message = await this.prisma.outreachMessage.create({
                    data: {
                        user_uuid: contact.user_uuid,
                        contact_uuid: contact.uuid,
                        channel,
                        subject: draft.subject ?? null,
                        content: draft.content,
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

    private async draftForChannel(
        channel: Channel,
        contact: Contact,
        lead: Lead,
        outreach_instructions: string,
    ): Promise<{ subject: string | null; content: string }> {
        const prompt = this.promptForChannel(channel, contact, lead, outreach_instructions);

        const { response } = await this.aiService.generateText({
            provider: AiProviders.openai,
            model: AiModels.openai.gpt4o,
            prompt,
            system: 'You are an expert B2B outreach copywriter. Produce drafts ready for human review.',
        });

        if (channel === Channel.EMAIL) {
            return this.parseEmailDraft(response);
        }
        return { subject: null, content: response.trim() };
    }

    private promptForChannel(
        channel: Channel,
        contact: Contact,
        lead: Lead,
        outreach_instructions: string,
    ): string {
        switch (channel) {
            case Channel.EMAIL:
                return buildEmailPrompt(contact, lead, outreach_instructions);
            case Channel.SMS:
                return buildSmsPrompt(contact, lead, outreach_instructions);
            case Channel.LINKEDIN:
                return buildLinkedInPrompt(contact, lead, outreach_instructions);
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
    }

    private parseEmailDraft(raw: string): { subject: string | null; content: string } {
        const match = raw.match(/^\s*Subject:\s*(.+)$/im);
        if (!match) {
            return { subject: null, content: raw.trim() };
        }
        const subject = match[1].trim();
        const body = raw.replace(match[0], '').trim();
        return { subject, content: body };
    }
}
