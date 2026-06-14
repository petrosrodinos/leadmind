import { Channel } from '@/generated/prisma';
import { CampaignAiAction } from '../dto/generate-campaign-message.dto';

interface PromptContext {
    campaign_name?: string;
    campaign_description?: string;
    sender_business_description?: string;
    user_prompt?: string;
    current_subject?: string;
    current_content?: string;
    language?: string;
}

const EMAIL_FOOTER_PLACEHOLDERS =
    '{{first_name}}, {{last_name}}, {{full_name}}, {{title}}, {{company_name}}, {{email}}, {{phone}}, {{website}}, {{website_display}}, {{booking_url}}, {{address}}, {{city}}, {{country}}, {{signature}}';

const SMS_FOOTER_PLACEHOLDERS =
    '{{first_name}}, {{full_name}}, {{company_name}}, {{booking_url}}';

const LINKEDIN_FOOTER_PLACEHOLDERS =
    '{{first_name}}, {{full_name}}, {{company_name}}, {{booking_url}}';

const CONTACT_PLACEHOLDERS =
    '{{contact_first_name}}, {{contact_last_name}}, {{contact_name}}, {{contact_company}}, {{contact_title}}';

function languageBlock(language?: string, preservePlaceholders = true): string {
    if (!language) return '';
    const placeholderLine = preservePlaceholders
        ? '- Placeholder tokens like {{first_name}}, {{booking_url}}, {{contact_first_name}} MUST stay as-is in English.'
        : '- Do NOT use curly-brace placeholders. Write concrete names and details.';
    return `
OUTPUT LANGUAGE — STRICT:
- Write the entire output in ${language}.
- Use natural ${language} idiom for B2B outreach. Do NOT mix languages.
${placeholderLine}
`.trim();
}

function campaignContext(ctx: PromptContext): string {
    const parts: string[] = [];
    if (ctx.campaign_name) parts.push(`Campaign name: ${ctx.campaign_name}`);
    if (ctx.campaign_description) parts.push(`Campaign description: ${ctx.campaign_description}`);
    if (ctx.user_prompt) parts.push(`Author's intent: ${ctx.user_prompt}`);
    if (parts.length === 0) return '';
    return `CAMPAIGN CONTEXT:\n"""\n${parts.join('\n')}\n"""`;
}

function senderBusinessContext(ctx: PromptContext): string {
    if (!ctx.sender_business_description) return '';
    return `SENDER / BUSINESS CONTEXT (use this to ground the message in what the sender actually offers; do not quote it verbatim):\n"""\n${ctx.sender_business_description}\n"""`;
}

function emailRules(): string {
    return `
HTML BODY RULES — STRICT:
- Use ONLY these tags: <p>, <br>, <strong>, <em>, <u>, <ul>, <ol>, <li>, <a href="...">, <h1>, <h2>, <h3>.
- Wrap each paragraph in <p>...</p>. Use <br> only for intentional intra-paragraph line breaks.
- Do NOT include inline styles, class, id, data-* attributes, or any on* handlers.
- Do NOT include <script>, <iframe>, <img>, <style>, <html>, <body>, <head>, <meta>.
- Do NOT wrap in <html>/<body> or in a markdown code block.

PLACEHOLDER RULES — STRICT:
- Sender placeholders (replaced at send time): ${EMAIL_FOOTER_PLACEHOLDERS}.
- Contact placeholders (replaced at send time): ${CONTACT_PLACEHOLDERS}.
- Use placeholders verbatim, including the double curly braces. Do NOT invent placeholders. Do NOT use square brackets like [Your Name]. Do NOT write any real or made-up sender/contact info.
- Anchors with placeholders: write {{website}} only inside href and {{website_display}} only as link text. {{booking_url}} only inside href.
- Placeholders are NOT allowed in the subject line.
`.trim();
}

function smsRules(): string {
    return `
SMS RULES — STRICT:
- Single text message only. Hard limit: 160 characters of rendered text.
- No subject line.
- If you sign off, use ONLY: ${SMS_FOOTER_PLACEHOLDERS}.
- For contact name, use: ${CONTACT_PLACEHOLDERS}.
- Placeholders are replaced at send time. Do NOT invent placeholders. Do NOT use square brackets. Do NOT write real or made-up info.
- CTA URLs use {{booking_url}} as a bare URL (no anchor): e.g. "Book: {{booking_url}}".
`.trim();
}

function linkedinRules(): string {
    return `
LINKEDIN DM RULES — STRICT:
- Short connection/conversation DM — NOT an email, NOT an SMS. Aim for 2-4 short sentences, under 500 characters.
- Conversational, personable, first-person tone. No subject line. No HTML.
- Open with a relevant, specific hook, then one clear value point, then a light CTA (e.g. a quick chat or a question).
- For contact name, use: ${CONTACT_PLACEHOLDERS}.
- If you sign off, use ONLY: ${LINKEDIN_FOOTER_PLACEHOLDERS}.
- Placeholders are replaced at send time. Do NOT invent placeholders. Do NOT use square brackets. Do NOT write real or made-up info.
- A CTA link uses {{booking_url}} as a bare URL (no anchor): e.g. "Grab a slot: {{booking_url}}".
`.trim();
}

function phoneCallRules(): string {
    return `
PHONE CALL SCRIPT RULES — STRICT:
- Plain-text call script for a live sales call — not email, SMS, or LinkedIn.
- Use short labeled sections: Opening, Value hook, Discovery questions, Objection handling, Close / next step.
- Conversational spoken language. No HTML. No subject line.
- Personalize with concrete names and details. Do NOT use curly-brace placeholders (e.g. {{first_name}}, {{booking_url}}).
- Do NOT use square brackets like [Your Name].
`.trim();
}

export function buildCampaignPrompt(
    channel: Channel,
    action: CampaignAiAction,
    ctx: PromptContext,
): { prompt: string; system: string } {
    const isEmail = channel === Channel.EMAIL;
    const isLinkedIn = channel === Channel.LINKEDIN;
    const isPhoneCall = channel === Channel.PHONE_CALL;
    const lang = languageBlock(ctx.language, !isPhoneCall);
    const channelLabel = isEmail
        ? Channel.EMAIL
        : isLinkedIn
          ? Channel.LINKEDIN
          : isPhoneCall
            ? Channel.PHONE_CALL
            : Channel.SMS;
    const rules = isEmail
        ? emailRules()
        : isLinkedIn
          ? linkedinRules()
          : isPhoneCall
            ? phoneCallRules()
            : smsRules();
    const campaignCtx = campaignContext(ctx);
    const senderCtx = senderBusinessContext(ctx);

    const outputSpec = isEmail
        ? `Output format (no markdown, no commentary, no code fences):
Subject: <subject line, under 80 chars, no placeholders>

<HTML body, 80-150 words, formal-but-warm tone, with a clear CTA. End with a sign-off using sender placeholders.>`
        : isLinkedIn
          ? `Output: only the LinkedIn DM body. No subject. No quotes. No commentary. No markdown.`
          : isPhoneCall
            ? `Output: only the call script body. No subject. No quotes. No commentary.`
            : `Output: only the SMS body. No subject. No quotes. No commentary.`;

    const existing =
        ctx.current_content
            ? `EXISTING DRAFT TO TRANSFORM:
"""
${ctx.current_subject ? `Subject: ${ctx.current_subject}\n\n` : ''}${ctx.current_content}
"""`
            : '';

    let taskLine = '';
    switch (action) {
        case 'generate':
            taskLine = `Draft a fresh ${channelLabel} for this marketing campaign based on the context and author's intent below.`;
            break;
        case 'improve':
            taskLine = `Improve the existing ${channelLabel} draft below. Keep the structure but make it clearer, more compelling, and tighter.`;
            break;
        case 'shorten':
            taskLine = isEmail
                ? `Shorten the existing email below to under 80 words while keeping the CTA and sign-off.`
                : isLinkedIn
                  ? `Shorten the existing LinkedIn DM below to 2-3 punchy sentences while keeping the hook and CTA.`
                  : isPhoneCall
                    ? `Shorten the existing call script below while keeping opening, value hook, and close.`
                    : `Shorten the existing SMS below to fit comfortably under 140 rendered characters.`;
            break;
        case 'tone_professional':
            taskLine = `Rewrite the existing ${channelLabel} below in a more professional, polished tone.`;
            break;
        case 'tone_friendly':
            taskLine = `Rewrite the existing ${channelLabel} below in a friendlier, more conversational tone.`;
            break;
        case 'tone_direct':
            taskLine = `Rewrite the existing ${channelLabel} below to be more direct and concise — get to the point fast.`;
            break;
        case 'personalize':
            taskLine = `Ensure the existing ${channelLabel} below makes good use of {{contact_first_name}} and {{contact_company}} placeholders so it reads naturally personalized per recipient.`;
            break;
    }

    const prompt = [
        taskLine,
        '',
        `TARGET CHANNEL: ${channelLabel}`,
        '',
        lang,
        '',
        senderCtx,
        '',
        campaignCtx,
        '',
        existing,
        '',
        rules,
        '',
        outputSpec,
    ]
        .filter((s) => s.length > 0)
        .join('\n');

    const system = isEmail
        ? 'You are an expert B2B outreach copywriter for email marketing campaigns. Produce drafts ready for human review.'
        : isLinkedIn
          ? 'You are an expert B2B outreach copywriter for LinkedIn DM campaigns. Produce drafts ready for human review.'
          : isPhoneCall
            ? 'You are an expert B2B outreach copywriter for phone call scripts. Produce drafts ready for human review.'
            : 'You are an expert B2B outreach copywriter for SMS marketing campaigns. Produce drafts ready for human review.';

    return { prompt, system };
}
