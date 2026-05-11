import { Contact, Lead } from '@/generated/prisma';
import { formatContactForAi } from '../utils/contact-ai-profile.utils';

export function buildScorePrompt(contact: Contact, lead: Lead, scoring_instructions: string): string {
    return `
You are scoring a sales lead from 1 (poor fit) to 10 (excellent fit) for a user with these targeting criteria:

USER SCORING / TARGETING CRITERIA:
"""
${scoring_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Return:
- score: integer 1-10
- reasoning: 1-2 sentences explaining the rating, referencing the targeting criteria
`.trim();
}

export function buildEmailPrompt(contact: Contact, lead: Lead, outreach_instructions: string): string {
    return `
You are drafting a cold outreach EMAIL for the lead below.

TARGET CHANNEL: EMAIL — produce a normal email with a subject line and an HTML body. Do not write SMS or LinkedIn DM style.

USER OUTREACH INSTRUCTIONS:
"""
${outreach_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output format (no markdown, no commentary, no code fences):
Subject: <subject line, under 80 chars>

<HTML body, 80-150 words, formal-but-warm tone, ending with a clear soft CTA>

HTML BODY RULES — STRICT:
- Use ONLY these tags: <p>, <br>, <strong>, <em>, <u>, <ul>, <ol>, <li>, <a href="...">, <h1>, <h2>, <h3>.
- Wrap each paragraph in <p>...</p>. Use <br> only for intentional intra-paragraph line breaks.
- Do NOT include inline styles, class, id, data-* attributes, or any on* event handlers.
- Do NOT include <script>, <iframe>, <img>, <style>, <html>, <body>, <head>, or <meta>.
- Anchor hrefs must use http, https, or mailto schemes only.
- Do NOT wrap the output in <html>/<body> or in a markdown code block.
`.trim();
}

export function buildSmsPrompt(contact: Contact, lead: Lead, outreach_instructions: string): string {
    return `
Draft a cold outreach SMS for this lead.

TARGET CHANNEL: SMS — single text message only. Hard limit: 160 characters. No emailSubject lines. No LinkedIn fluff.

USER OUTREACH INSTRUCTIONS:
"""
${outreach_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output: only the SMS body. No subject. No quotes. No commentary.
`.trim();
}

export function buildLinkedInPrompt(contact: Contact, lead: Lead, outreach_instructions: string): string {
    return `
Draft a LinkedIn outreach DM for this lead.

TARGET CHANNEL: LINKEDIN — short connection/conversation DM (not an email, not SMS).

USER OUTREACH INSTRUCTIONS:
"""
${outreach_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output: only the DM body. No commentary.
`.trim();
}

export const AiScoringSystemPrompt = `
You are a sales-qualification assistant scoring leads against targeting criteria.
`;
