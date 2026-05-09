import * as cheerio from 'cheerio';
import type { CrawledPage } from './website-content-crawler.interfaces';

function htmlToPlainText(html: string): string | null {
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg').remove();
    const raw = $('body').length ? $('body').text() : $.root().text();
    const normalized = raw.replace(/\s+/g, ' ').trim();
    return normalized || null;
}

export function plainTextFromCrawledPage(page: CrawledPage): string | null {
    const fromText = page.text?.trim();
    if (fromText) return fromText;
    const fromMarkdown = page.markdown?.trim();
    if (fromMarkdown) return fromMarkdown;
    const html = page.html?.trim();
    if (!html) return null;
    return htmlToPlainText(html);
}
