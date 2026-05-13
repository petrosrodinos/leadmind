import type { Lead } from '@/generated/prisma';
import { z } from 'zod';

export const MAX_WEBSITE_CONTEXT_CHARS = 3_000;

export const MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS = 10_000;

export const MAX_LINKEDIN_CONTEXT_CHARS = 8_000;

export const MAX_GOOGLE_CONTEXT_CHARS = 4_000;

export const MAX_ENRICHMENT_SUMMARY_CONTEXT_CHARS = 18_000;

export const LEAD_ENRICHMENT_SYSTEM_PROMPT =
    'You are a B2B sales research assistant for outbound sales. Treat the CRM fields and quoted excerpts in the user message as primary evidence (website text, LinkedIn JSON, Google snapshot). You may bring in other reliable context when it clearly helps, but do not contradict the supplied material or invent specifics. If identity is ambiguous, say so. Plain prose only, no markdown, under 280 words.';

export const leadEnrichmentSummaryAiResponseSchema = z.object({
    summary: z.string(),
    metadata: z.any().optional(),
});

export type LeadEnrichmentSummaryAiResponse = z.infer<typeof leadEnrichmentSummaryAiResponseSchema>;

export const LEAD_ENRICHMENT_SUMMARY_SYSTEM_PROMPT =
    'You summarize B2B lead enrichment using the supplied CRM fields (including source type and description) together with the latest enrichment record per source. Fill `summary` with one concise CRM research summary: plain prose, no markdown, under 320 words; prefer concrete facts, role/company context, and personalization hooks; mention uncertainty when data conflicts or is thin. Fill optional `metadata` with a flat or nested JSON object of extra structured facts not already stored as columns (examples: services as string array, years_in_business as number, tech_stack, headcount_band). Omit keys you cannot support from the evidence; do not invent specifics.';

export const LINKEDIN_ENRICHMENT_SUMMARY_SYSTEM_PROMPT =
    'You write a concise CRM-ready summary of a LinkedIn company page or person profile using only the JSON in the user message. Plain prose, no markdown, under 320 words. Cover what the entity is, role or positioning, industry and scale signals when present, and practical hooks for outbound. If the JSON is thin, say so briefly and summarize what is known. Do not invent facts beyond the JSON.';

export function buildLinkedInEnrichmentSummaryUserPrompt(contextJson: string): string {
    const body = contextJson.trim().slice(0, MAX_LINKEDIN_CONTEXT_CHARS);
    return [
        'LinkedIn scrape (JSON fields only):',
        body,
        '',
        'Write the single enrichment summary paragraph for this LinkedIn record.',
    ].join('\n');
}

export const WEBSITE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT =
    'You write a concise CRM-ready summary of a single crawled website page using only the URL, page title, and text excerpt in the user message. Plain prose, no markdown, under 320 words. Cover what the organization or page appears to offer, audience or positioning if inferable, and hooks for outbound. If the excerpt is thin or boilerplate, say so briefly. Do not invent specifics beyond the excerpt.';

export function buildWebsiteEnrichmentSummaryUserPrompt(contextJson: string): string {
    const body = contextJson.trim().slice(0, MAX_WEBSITE_ENRICHMENT_SUMMARY_CONTEXT_CHARS);
    return [
        'Website crawl (JSON with url, title, excerpt):',
        body,
        '',
        'Write the single enrichment summary paragraph for this website crawl.',
    ].join('\n');
}

export const GOOGLE_ENRICHMENT_SUMMARY_SYSTEM_PROMPT =
    'You write a concise CRM-ready summary of Google search results for a B2B lead lookup using only the query and result lines in the user message. Plain prose, no markdown, under 320 words. Synthesize likely identity, company signals, and notable third-party mentions; note ambiguity when results conflict. Do not invent URLs or claims not supported by the lines.';

export function buildGoogleEnrichmentSummaryUserPrompt(query: string, resultsContext: string): string {
    const q = query.trim().slice(0, 320);
    const body = resultsContext.trim().slice(0, MAX_GOOGLE_CONTEXT_CHARS);
    return [
        `Search query: ${q}`,
        '',
        'Result lines (title | url | snippet):',
        body || '(no organic results parsed)',
        '',
        'Write the single enrichment summary paragraph for this Google search snapshot.',
    ].join('\n');
}

export function buildLeadEnrichmentSummaryPrompt(
    lead: Lead,
    sourceContext: string,
): string {
    const fields = [
        `Source type: ${lead.source_type}`,
        lead.name?.trim() && `Name: ${lead.name.trim()}`,
        lead.title?.trim() && `Title/role: ${lead.title.trim()}`,
        lead.company?.trim() && `Company: ${lead.company.trim()}`,
        lead.email?.trim() && `Email: ${lead.email.trim()}`,
        lead.phone?.trim() && `Phone: ${lead.phone.trim()}`,
        lead.linkedin_url?.trim() && `LinkedIn: ${lead.linkedin_url.trim()}`,
        lead.website?.trim() && `Website: ${lead.website.trim()}`,
        lead.location?.trim() && `Location: ${lead.location.trim()}`,
        lead.industry?.trim() && `Industry: ${lead.industry.trim()}`,
        lead.description?.trim() && `Description: ${lead.description.trim()}`,
    ].filter(Boolean) as string[];

    return [
        'Regenerate the lead enrichment summary from the CRM fields below and the latest enrichment record for each source.',
        '',
        'CRM fields:',
        fields.join('\n'),
        '',
        'Latest source records:',
        sourceContext.trim().slice(0, MAX_ENRICHMENT_SUMMARY_CONTEXT_CHARS) || '(none)',
        '',
        'Produce the structured response fields `summary` and optional `metadata` as described in the system message.',
    ].join('\n');
}

export function buildLeadAiResearchPrompt(
    lead: Lead,
    websiteExcerpt: string | null,
    linkedinExcerpt: string | null,
    googleSearchExcerpt: string | null,
): string {
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
        'Research this lead for outbound sales using the CRM fields and quoted excerpts below (website text, LinkedIn JSON, Google search snapshot) as the main sources.';

    let body = `${intro}\n\nCRM fields:\n${lines.join('\n')}`;

    if (websiteExcerpt?.trim()) {
        body += `\n\nWebsite text excerpt (may be partial):\n"""\n${websiteExcerpt.trim().slice(0, MAX_WEBSITE_CONTEXT_CHARS)}\n"""`;
    }

    if (linkedinExcerpt?.trim()) {
        body += `\n\nLinkedIn scrape (structured fields from profile or company page, JSON):\n"""\n${linkedinExcerpt.trim().slice(0, MAX_LINKEDIN_CONTEXT_CHARS)}\n"""`;
    }

    if (googleSearchExcerpt?.trim()) {
        body += `\n\nGoogle search snapshot (titles, URLs, snippets from a prior enrichment run):\n"""\n${googleSearchExcerpt.trim().slice(0, MAX_GOOGLE_CONTEXT_CHARS)}\n"""`;
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
