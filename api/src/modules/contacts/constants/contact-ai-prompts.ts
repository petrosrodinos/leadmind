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

TARGET CHANNEL: EMAIL — produce a normal email with a subject line and body. Do not write SMS or LinkedIn DM style.

USER OUTREACH INSTRUCTIONS:
"""
${outreach_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

Output format (no markdown, no commentary):
Subject: <subject line, under 80 chars>

<body in plain prose, 80-150 words, formal-but-warm tone, ending with a clear soft CTA>
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
