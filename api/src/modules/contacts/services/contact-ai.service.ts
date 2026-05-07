import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { Channel, Contact, Filter, Lead, MsgStatus, OutreachMessage } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { AiService } from '@/integrations/ai/services/ai.service';
import { AiModels, AiProviders } from '@/integrations/ai/interfaces/ai.interface';

const SCORE_SCHEMA = z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
});

type ScoreResult = z.infer<typeof SCORE_SCHEMA>;

const formatLead = (lead: Lead): string => {
    const enrichment_summary =
        lead.enrichment_data && typeof lead.enrichment_data === 'object' && 'summary' in lead.enrichment_data
            ? String((lead.enrichment_data as { summary?: unknown }).summary ?? '')
            : '';

    return [
        `Name: ${lead.name ?? 'N/A'}`,
        `Title: ${lead.title ?? 'N/A'}`,
        `Company: ${lead.company ?? 'N/A'}`,
        `Industry: ${lead.industry ?? 'N/A'}`,
        `Location: ${lead.location ?? 'N/A'}`,
        `Website: ${lead.website ?? 'N/A'}`,
        `Email: ${lead.email ?? 'N/A'}`,
        `LinkedIn: ${lead.linkedin_url ?? 'N/A'}`,
        `Description: ${lead.description ?? 'N/A'}`,
        enrichment_summary ? `Website summary: ${enrichment_summary}` : '',
    ]
        .filter(Boolean)
        .join('\n');
};

const SCORE_PROMPT = (lead: Lead, ai_instructions: string): string => `
You are scoring a sales lead from 1 (poor fit) to 10 (excellent fit) for a user with these targeting criteria:

USER TARGETING CRITERIA:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatLead(lead)}
"""

Return:
- score: integer 1-10
- reasoning: 1-2 sentences explaining the rating, referencing the targeting criteria
`.trim();

const EMAIL_PROMPT = (lead: Lead, ai_instructions: string): string => `
You are drafting a cold outreach EMAIL for the lead below, using the user's outreach instructions.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatLead(lead)}
"""

Output format (no markdown, no commentary):
Subject: <subject line, under 80 chars>

<body in plain prose, 80-150 words, formal-but-warm tone, ending with a clear soft CTA>
`.trim();

const SMS_PROMPT = (lead: Lead, ai_instructions: string): string => `
Draft a cold outreach SMS for this lead. Hard limit: 160 characters. No greeting fluff. Friendly, direct, with a single soft CTA.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatLead(lead)}
"""

Output: only the SMS body. No subject. No quotes. No commentary.
`.trim();

const LINKEDIN_PROMPT = (lead: Lead, ai_instructions: string): string => `
Draft a LinkedIn outreach DM for this lead. Conversational, peer-to-peer tone. 60-120 words. No subject. End with a low-pressure CTA.

USER OUTREACH INSTRUCTIONS:
"""
${ai_instructions}
"""

LEAD PROFILE:
"""
${formatLead(lead)}
"""

Output: only the DM body. No commentary.
`.trim();

@Injectable()
export class ContactAiService {
    private readonly logger = new Logger(ContactAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) { }

    /**
     * Score a Contact 1-10 against the parent filter's `ai_instructions`.
     * Idempotent: returns the existing score if already set.
     */
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
            prompt: SCORE_PROMPT(lead, filter.ai_instructions),
            system: 'You are a sales-qualification assistant scoring leads against targeting criteria.',
        });

        await this.prisma.contact.update({
            where: { uuid: contact.uuid },
            data: { score: response.score },
        });

        this.logger.log(
            `Contact ${contact.uuid}: scored ${response.score}/10 (${usage.totalTokens} tokens, $${usage.totalCost.toFixed(5)})`,
        );

        return response.score;
    }

    /**
     * Draft one OutreachMessage per channel listed on the parent filter.
     * - No-op when filter.ai_instructions is empty or filter.channels is empty.
     * - Skips channels that already have a PENDING message for this contact (preserves user edits).
     * Returns the newly created rows only.
     */
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
                const draft = await this.draftForChannel(channel, lead, filter.ai_instructions);

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
        lead: Lead,
        ai_instructions: string,
    ): Promise<{ subject: string | null; content: string }> {
        const prompt = this.promptForChannel(channel, lead, ai_instructions);

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

    private promptForChannel(channel: Channel, lead: Lead, ai_instructions: string): string {
        switch (channel) {
            case Channel.EMAIL:
                return EMAIL_PROMPT(lead, ai_instructions);
            case Channel.SMS:
                return SMS_PROMPT(lead, ai_instructions);
            case Channel.LINKEDIN:
                return LINKEDIN_PROMPT(lead, ai_instructions);
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
