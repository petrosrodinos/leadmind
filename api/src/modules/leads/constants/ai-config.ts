export const HOMEPAGE_FETCH_TIMEOUT_MS = 10_000;
export const MAX_HTML_BYTES = 10_000;
export const MAX_TEXT_CHARS = 3_000;

export const ENRICH_PROMPT = (url: string, page_text: string): string => `
You are analyzing a company website to produce a concise enrichment summary that helps salespeople quickly understand what this business does.

Website URL: ${url}

Extracted page text (truncated):
"""
${page_text}
"""

Return a short, factual summary in plain prose (no markdown). Cover, when present:
- What the company does (product/service)
- Industry / target market
- Notable signals (size, location, recent news, tech stack)

Keep it under 200 words. If the text is uninformative, say so explicitly.
`.trim();