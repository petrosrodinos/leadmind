import type { Lead } from '@/generated/prisma';
import { AiProviders, type AiProvider } from '@/integrations/ai/interfaces/ai.interface';

export const MAX_WEBSITE_CONTEXT_CHARS = 3_000;

export const PERPLEXITY_LEAD_SYSTEM_PROMPT =
    'You are a B2B sales research assistant with live web search. Ground answers in what you find online. Prefer recent, verifiable facts. If identity is ambiguous, say so. Plain prose only, no markdown, under 280 words.';

export const CLAUDE_LEAD_SYSTEM_PROMPT =
    'You are a B2B sales research assistant. Use only the CRM fields and website excerpt in the user message. Do not claim you browsed the live web. If identity is ambiguous, say so. Plain prose only, no markdown, under 280 words.';

export function buildLeadAiResearchPrompt(lead: Lead, websiteExcerpt: string | null, provider: AiProvider): string {
    const lines = [
        lead.name?.trim() && `Name: ${lead.name.trim()}`,
        lead.title?.trim() && `Title/role: ${lead.title.trim()}`,
        lead.company?.trim() && `Company: ${lead.company.trim()}`,
        lead.email?.trim() && `Email: ${lead.email.trim()}`,
        lead.phone?.trim() && `Phone: ${lead.phone.trim()}`,
        lead.linkedin_url?.trim() && `LinkedIn: ${lead.linkedin_url.trim()}`,
        lead.website?.trim() && `Website: ${lead.website.trim()}`,
        lead.location?.trim() && `Location: ${lead.location.trim()}`,
        lead.industry?.trim() && `Industry: ${lead.industry.trim()}`,
    ].filter(Boolean) as string[];

    const intro =
        provider === AiProviders.perplexity
            ? 'Search the web and research this lead for outbound sales.'
            : 'Research this lead for outbound sales using only the CRM fields and website excerpt below (no live web browsing).';

    let body = `${intro}\n\nCRM fields:\n${lines.join('\n')}`;

    if (websiteExcerpt?.trim()) {
        body += `\n\nWebsite text excerpt (may be partial):\n"""\n${websiteExcerpt.trim().slice(0, MAX_WEBSITE_CONTEXT_CHARS)}\n"""`;
    }

    body +=
        '\n\nSummarize: who this person likely is, what their organization does, market/role signals, and concrete personalization hooks. If data is thin, say what is missing.';

    return body.trim();
}

export function leadHasAiResearchSeed(lead: Lead): boolean {
    return Boolean(
        lead.name?.trim() ||
            lead.company?.trim() ||
            lead.email?.trim() ||
            lead.linkedin_url?.trim() ||
            lead.website?.trim(),
    );
}
