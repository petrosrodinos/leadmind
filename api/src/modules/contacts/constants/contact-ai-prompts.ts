import { Contact, Lead } from '@/generated/prisma';
import { formatContactForAi } from '../utils/contact-ai-profile.utils';

const EMAIL_FOOTER_PLACEHOLDERS = [
    '{{first_name}}',
    '{{last_name}}',
    '{{full_name}}',
    '{{title}}',
    '{{company_name}}',
    '{{email}}',
    '{{phone}}',
    '{{website}}',
    '{{booking_url}}',
    '{{address}}',
    '{{city}}',
    '{{country}}',
    '{{signature}}',
].join(', ');

const SMS_FOOTER_PLACEHOLDERS = [
    '{{first_name}}',
    '{{full_name}}',
    '{{company_name}}',
    '{{booking_url}}',
].join(', ');

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

<HTML body, 80-150 words, formal-but-warm tone, ending with a clear soft CTA (prefer offering a call via the {{booking_url}} placeholder when relevant) followed by a sign-off / footer>

HTML BODY RULES — STRICT:
- Use ONLY these tags: <p>, <br>, <strong>, <em>, <u>, <ul>, <ol>, <li>, <a href="...">, <h1>, <h2>, <h3>.
- Wrap each paragraph in <p>...</p>. Use <br> only for intentional intra-paragraph line breaks.
- Do NOT include inline styles, class, id, data-* attributes, or any on* event handlers.
- Do NOT include <script>, <iframe>, <img>, <style>, <html>, <body>, <head>, or <meta>.
- Anchor hrefs must use http, https, or mailto schemes only.
- Do NOT wrap the output in <html>/<body> or in a markdown code block.

SIGN-OFF / FOOTER RULES — STRICT:
- The email MUST end with a polite sign-off plus a sender contact block.
- For sender details (name, company, contact info, website, address) use ONLY these placeholders, exactly as written, including the double curly braces:
  ${EMAIL_FOOTER_PLACEHOLDERS}
- Placeholders are replaced with the sender's real profile data at send time. Do NOT invent placeholders, do NOT use square brackets like [Your Name], do NOT write any real or made-up personal/contact info.
- A good footer looks like:
  <p>Best,<br><strong>{{full_name}}</strong><br>{{title}} · {{company_name}}<br>{{email}} · {{phone}}<br><a href="{{website}}">{{website}}</a></p>
- It is fine to omit any placeholder that would not naturally appear in the footer (e.g. drop {{phone}} for a more text-only feel). Do not pad with placeholders for their own sake.
- Same placeholders may also be used in the body when it reads naturally (e.g. signing off with {{first_name}}, or offering a meeting via <a href="{{booking_url}}">book a quick call</a>). They are not allowed in the subject line.
- The {{booking_url}} placeholder should be used as the href of an anchor (never as visible link text), e.g. <a href="{{booking_url}}">grab a slot on my calendar</a>.
`.trim();
}

export function buildSmsPrompt(contact: Contact, lead: Lead, outreach_instructions: string): string {
    return `
Draft a cold outreach SMS for this lead.

TARGET CHANNEL: SMS — single text message only. Hard limit: 160 characters. No subject lines. No LinkedIn fluff.

USER OUTREACH INSTRUCTIONS:
"""
${outreach_instructions}
"""

LEAD PROFILE:
"""
${formatContactForAi(contact, lead)}
"""

SIGN-OFF RULES — STRICT:
- If you sign off, use ONLY these placeholders (exactly as written, including the double curly braces):
  ${SMS_FOOTER_PLACEHOLDERS}
- Placeholders are replaced with the sender's profile data at send time. Do NOT invent placeholders, do NOT use square brackets like [Your Name], do NOT write any real or made-up sender info.
- A typical sign-off is "- {{first_name}}" or "- {{first_name}} @ {{company_name}}". Keep it minimal — the 160-char limit includes the rendered placeholder values.
- If you include a CTA to book a call, use the {{booking_url}} placeholder as a bare URL (no anchor / no markdown), e.g. "Book a call: {{booking_url}}".

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

SIGN-OFF RULES — STRICT:
- If you sign off, use ONLY these placeholders (exactly as written, including the double curly braces):
  ${SMS_FOOTER_PLACEHOLDERS}
- Do NOT invent placeholders, do NOT use square brackets like [Your Name], do NOT write any real or made-up sender info.

Output: only the DM body. No commentary.
`.trim();
}

export const AiScoringSystemPrompt = `
You are a sales-qualification assistant scoring leads against targeting criteria.
`;
