import { Contact, Lead } from '@/generated/prisma';
import { formatContactForAi } from '../utils/contact-ai-profile.utils';

export function buildScorePrompt(contact: Contact, lead: Lead, ai_instructions: string): string {
    return `
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
}

export function buildEmailPrompt(contact: Contact, lead: Lead, ai_instructions: string): string {
    return `
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
}

export function buildSmsPrompt(contact: Contact, lead: Lead, ai_instructions: string): string {
    return `
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
}

export function buildLinkedInPrompt(contact: Contact, lead: Lead, ai_instructions: string): string {
    return `
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
}

export const AiScoringSystemPrompt = `
You are a sales-qualification assistant scoring leads against targeting criteria.
`;
