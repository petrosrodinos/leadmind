import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { Channel, Contact, Filter, Lead, MsgStatus, OutreachMessage } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';
import { ElasticsearchService } from '@/integrations/elasticsearch/elasticsearch.service';

const SCORE_SCHEMA = z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
});

type ScoreResult = z.infer<typeof SCORE_SCHEMA>;

const formatContactForAi = (contact: Contact, lead: Lead): string => {
    const enrichment_summary =
        lead.enrichment_data && typeof lead.enrichment_data === 'object' && 'summary' in lead.enrichment_data
            ? String((lead.enrichment_data as { summary?: unknown }).summary ?? '')
            : '';

    return [
        `Name: ${contact.name ?? 'N/A'}`,
        `Title: ${contact.title ?? 'N/A'}`,
        `Company: ${contact.company ?? 'N/A'}`,
        `Industry: ${contact.industry ?? 'N/A'}`,
        `Location: ${contact.location ?? 'N/A'}`,
        `Website: ${contact.website ?? 'N/A'}`,
        `Email: ${contact.email ?? 'N/A'}`,
        `Phone: ${contact.phone ?? 'N/A'}`,
        `LinkedIn: ${contact.linkedin_url ?? 'N/A'}`,
        `Description: ${contact.description ?? 'N/A'}`,
        enrichment_summary ? `Website summary: ${enrichment_summary}` : '',
    ]
        .filter(Boolean)
        .join('\n');
};

const SCORE_PROMPT = (contact: Contact, lead: Lead, ai_instructions: string): string => `
You are scoring a sales lead from 1 (poor fit) to 10 (excellent fit) for a user with these targeting criteria:

USER TARGETING CRITERIA:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Return:
- score: integer 1-10
- reasoning: 1-2 sentences explaining the rating, referencing the targeting criteria
`.trim();

const EMAIL_PROMPT = (contact: Contact, lead: Lead, ai_instructions: string): string => `
You are drafting a cold outreach EMAIL for the lead below, using the user's outreach instructions.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output format (no markdown, no commentary):
Subject: <subject line, under 80 chars>

<body in plain prose, 80-150 words, formal-but-warm tone, ending with a clear soft CTA>
`.trim();

const SMS_PROMPT = (contact: Contact, lead: Lead, ai_instructions: string): string => `
Draft a cold outreach SMS for this lead. Hard limit: 160 characters. No greeting fluff. Friendly, direct, with a single soft CTA.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output: only the SMS body. No subject. No quotes. No commentary.
`.trim();

const LINKEDIN_PROMPT = (contact: Contact, lead: Lead, ai_instructions: string): string => `
Draft a LinkedIn outreach DM for this lead. Conversational, peer-to-peer tone. 60-120 words. No subject. End with a low-pressure CTA.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output: only the DM body. No commentary.
`.trim();

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

        if (!filter.ai_instructions) {
            this.logger.warn(`Contact ${contact.uuid}: filter has no ai_instructions, skipping score`);
            return 0;
        }

        const { response, usage } = await this.aiService.generateObjectWithSchema<ScoreResult>({
            provider: AiProviders.openai,
            model: AiModels.openai.gpt4oMini,
            schema: SCORE_SCHEMA,
            prompt: SCORE_PROMPT(contact, lead, filter.ai_instructions),
            system: 'You are a sales-qualification assistant scoring leads against targeting criteria.',
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
        if (!filter.ai_instructions || filter.channels.length === 0) {
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
                const draft = await this.draftForChannel(channel, contact, lead, filter.ai_instructions);

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
                this.logger.error(
                    `Contact ${contact.uuid}/${channel}: draft failed: ${message}`,
                );
            }
        }

        return created;
    }

    private async draftForChannel(
        channel: Channel,
        contact: Contact,
        lead: Lead,
        ai_instructions: string,
    ): Promise<{ subject: string | null; content: string }> {
        const prompt = this.promptForChannel(channel, contact, lead, ai_instructions);

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
        ai_instructions: string,
    ): string {
        switch (channel) {
            case Channel.EMAIL:
                return EMAIL_PROMPT(contact, lead, ai_instructions);
            case Channel.SMS:
                return SMS_PROMPT(contact, lead, ai_instructions);
            case Channel.LINKEDIN:
                return LINKEDIN_PROMPT(contact, lead, ai_instructions);
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
