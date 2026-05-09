import { Injectable, Logger } from '@nestjs/common';
import { ApifyClient } from '../apify.client';
import { APIFY_ACTORS } from '../apify.constants';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import {
    CrawledPage,
    CrawlSinglePageOptions,
    ExtractedContact,
    WebsiteContentCrawlerQueryConfig,
    WebsiteContentCrawlerRawItem,
} from './website-content-crawler.interfaces';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const LINKEDIN_REGEX = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company|pub)\/[A-Za-z0-9_\-%/]+/gi;
const PHONE_REGEX = /\+?\d[\d\s().-]{7,}\d/g;

@Injectable()
export class WebsiteContentCrawlerAdapter
    implements ApifyAdapter<WebsiteContentCrawlerQueryConfig, WebsiteContentCrawlerRawItem> {

    private readonly logger = new Logger(WebsiteContentCrawlerAdapter.name);

    constructor(private readonly apifyClient: ApifyClient) { }

    /**
     * Maps the typed QueryConfig to the Apify actor's snake-case → camelCase input shape.
     * Exposes every input documented for `apify/website-content-crawler`.
     */
    buildInput(query_config: WebsiteContentCrawlerQueryConfig): ApifyRunInput {
        const q = query_config;
        const input: ApifyRunInput = {
            startUrls: q.start_urls.map((url) => ({ url })),
            proxyConfiguration: q.proxy_configuration ?? { useApifyProxy: true },
        };

        if (q.crawler_type) input.crawlerType = q.crawler_type;
        if (q.include_url_globs?.length) input.includeUrlGlobs = q.include_url_globs.map((glob) => ({ glob }));
        if (q.exclude_url_globs?.length) input.excludeUrlGlobs = q.exclude_url_globs.map((glob) => ({ glob }));
        if (q.max_crawl_depth !== undefined) input.maxCrawlDepth = q.max_crawl_depth;
        if (q.max_crawl_pages !== undefined) input.maxCrawlPages = q.max_crawl_pages;
        if (q.max_results !== undefined) input.maxResults = q.max_results;
        if (q.use_sitemaps !== undefined) input.useSitemaps = q.use_sitemaps;
        if (q.use_llms_txt !== undefined) input.useLlmsTxt = q.use_llms_txt;
        if (q.respect_robots_txt !== undefined) input.respectRobotsTxtFile = q.respect_robots_txt;
        if (q.keep_url_fragments !== undefined) input.keepUrlFragments = q.keep_url_fragments;
        if (q.ignore_canonical_url !== undefined) input.ignoreCanonicalUrl = q.ignore_canonical_url;

        if (q.initial_cookies?.length) input.initialCookies = q.initial_cookies;
        if (q.custom_http_headers) input.customHttpHeaders = q.custom_http_headers;
        if (q.sign_http_requests !== undefined) input.signHttpRequests = q.sign_http_requests;
        if (q.ignore_https_errors !== undefined) input.ignoreHttpsErrors = q.ignore_https_errors;
        if (q.request_timeout_secs !== undefined) input.requestTimeoutSecs = q.request_timeout_secs;
        if (q.min_file_download_speed_kbps !== undefined) input.minFileDownloadSpeedKBps = q.min_file_download_speed_kbps;

        if (q.initial_concurrency !== undefined) input.initialConcurrency = q.initial_concurrency;
        if (q.max_concurrency !== undefined) input.maxConcurrency = q.max_concurrency;
        if (q.max_request_retries !== undefined) input.maxRequestRetries = q.max_request_retries;
        if (q.max_session_rotations !== undefined) input.maxSessionRotations = q.max_session_rotations;

        if (q.dynamic_content_wait_secs !== undefined) input.dynamicContentWaitSecs = q.dynamic_content_wait_secs;
        if (q.wait_for_selector) input.waitForSelector = q.wait_for_selector;
        if (q.soft_wait_for_selector) input.softWaitForSelector = q.soft_wait_for_selector;
        if (q.max_scroll_height_pixels !== undefined) input.maxScrollHeightPixels = q.max_scroll_height_pixels;
        if (q.remove_cookie_warnings !== undefined) input.removeCookieWarnings = q.remove_cookie_warnings;
        if (q.block_media !== undefined) input.blockMedia = q.block_media;
        if (q.expand_iframes !== undefined) input.expandIframes = q.expand_iframes;
        if (q.click_elements_css_selector) input.clickElementsCssSelector = q.click_elements_css_selector;
        if (q.sticky_container_css_selector) input.stickyContainerCssSelector = q.sticky_container_css_selector;
        if (q.page_function) input.pageFunction = q.page_function;

        if (q.keep_elements_css_selector) input.keepElementsCssSelector = q.keep_elements_css_selector;
        if (q.remove_elements_css_selector) input.removeElementsCssSelector = q.remove_elements_css_selector;
        if (q.html_transformer) input.htmlTransformer = q.html_transformer;
        if (q.readable_text_char_threshold !== undefined) input.readableTextCharThreshold = q.readable_text_char_threshold;
        if (q.aggressive_prune !== undefined) input.aggressivePrune = q.aggressive_prune;

        if (q.save_html !== undefined) input.saveHtml = q.save_html;
        if (q.save_html_as_file !== undefined) input.saveHtmlAsFile = q.save_html_as_file;
        if (q.save_markdown !== undefined) input.saveMarkdown = q.save_markdown;
        if (q.save_files !== undefined) input.saveFiles = q.save_files;
        if (q.save_content_types) input.saveContentTypes = q.save_content_types;
        if (q.save_screenshots !== undefined) input.saveScreenshots = q.save_screenshots;

        if (q.client_side_min_change_percentage !== undefined) input.clientSideMinChangePercentage = q.client_side_min_change_percentage;
        if (q.rendering_type_detection_percentage !== undefined) input.renderingTypeDetectionPercentage = q.rendering_type_detection_percentage;
        if (q.reuse_stored_detection_results !== undefined) input.reuseStoredDetectionResults = q.reuse_stored_detection_results;

        if (q.debug_mode !== undefined) input.debugMode = q.debug_mode;
        if (q.debug_log !== undefined) input.debugLog = q.debug_log;
        if (q.store_skipped_urls !== undefined) input.storeSkippedUrls = q.store_skipped_urls;

        return input;
    }

    /**
     * Lead-extraction path used by ApifyService.scrapeLeads().
     * Filters to items with at least one email or LinkedIn URL.
     */
    normalize(raw_items: WebsiteContentCrawlerRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item) => this.toNormalizedLead(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));
    }

    /** Run the actor and return the unmodified dataset items. */
    async run(query_config: WebsiteContentCrawlerQueryConfig): Promise<WebsiteContentCrawlerRawItem[]> {
        const input = this.buildInput(query_config);
        return this.apifyClient.runActor<WebsiteContentCrawlerRawItem>(
            APIFY_ACTORS.WEBSITE_CONTENT_CRAWLER,
            input,
        );
    }

    /** Run the actor and return typed `CrawledPage` records (one per dataset item). */
    async crawlPages(query_config: WebsiteContentCrawlerQueryConfig): Promise<CrawledPage[]> {
        const items = await this.run(query_config);
        return items.map((item) => this.toCrawledPage(item)).filter((p): p is CrawledPage => p !== null);
    }

    /** Convenience: crawl a single URL with depth 0 / one page. */
    async crawlSinglePage(url: string, options: CrawlSinglePageOptions = {}): Promise<CrawledPage | null> {
        const pages = await this.crawlPages({
            save_html: false,
            save_markdown: true,
            html_transformer: 'readableTextIfPossible',
            ...options,
            start_urls: [url],
            max_crawl_depth: 0,
            max_crawl_pages: 1,
            max_results: 1,
        });
        return pages[0] ?? null;
    }

    /** Convenience: extract all unique emails found across crawled pages. */
    async extractEmails(query_config: WebsiteContentCrawlerQueryConfig): Promise<string[]> {
        const items = await this.run(query_config);
        const set = new Set<string>();
        for (const item of items) {
            for (const email of this.matchAll(item, EMAIL_REGEX)) set.add(email.toLowerCase());
        }
        return [...set];
    }

    /** Convenience: extract all unique LinkedIn URLs found across crawled pages. */
    async extractLinkedInUrls(query_config: WebsiteContentCrawlerQueryConfig): Promise<string[]> {
        const items = await this.run(query_config);
        const set = new Set<string>();
        for (const item of items) {
            for (const url of this.matchAll(item, LINKEDIN_REGEX)) set.add(url);
        }
        return [...set];
    }

    /**
     * Per-page contact extraction: for every crawled page, returns all emails,
     * LinkedIn URLs, and phone numbers found in its content.
     */
    async extractContacts(query_config: WebsiteContentCrawlerQueryConfig): Promise<ExtractedContact[]> {
        const items = await this.run(query_config);
        return items
            .map((item) => this.toExtractedContact(item))
            .filter((c) => c.emails.length || c.linkedin_urls.length || c.phones.length);
    }

    /**
     * Run the actor and run a `NormalizedLead` per page that exposes at least
     * one email or LinkedIn URL — the same shape produced by `normalize()`.
     */
    async extractLeads(query_config: WebsiteContentCrawlerQueryConfig): Promise<NormalizedLead[]> {
        const items = await this.run(query_config);
        return this.normalize(items);
    }

    private toCrawledPage(item: WebsiteContentCrawlerRawItem): CrawledPage | null {
        const url = item.url || item.loadedUrl;
        if (!url) return null;
        return {
            url,
            title: item.title,
            text: item.text,
            markdown: item.markdown,
            html: item.html,
            html_url: item.htmlUrl,
            screenshot_url: item.screenshotUrl,
            metadata: item.metadata,
            depth: item.depth,
        };
    }

    private toExtractedContact(item: WebsiteContentCrawlerRawItem): ExtractedContact {
        const emails = [...new Set(this.matchAll(item, EMAIL_REGEX).map((s) => s.toLowerCase()))];
        const linkedin_urls = [...new Set(this.matchAll(item, LINKEDIN_REGEX))];
        const phones = [...new Set(this.matchAll(item, PHONE_REGEX).map((s) => s.trim()))];
        return {
            url: item.url || item.loadedUrl || '',
            emails,
            linkedin_urls,
            phones,
            title: item.title,
        };
    }

    private toNormalizedLead(item: WebsiteContentCrawlerRawItem): NormalizedLead {
        const haystack_matches = this.matchAll(item, EMAIL_REGEX);
        const linkedin_matches = this.matchAll(item, LINKEDIN_REGEX);
        const phone_matches = this.matchAll(item, PHONE_REGEX);

        return {
            name: item.title || undefined,
            email: haystack_matches[0]?.toLowerCase(),
            linkedin_url: linkedin_matches[0],
            phone: phone_matches[0]?.trim(),
            website: item.url || item.loadedUrl || undefined,
            description: item.title || undefined,
            raw_data: item,
        };
    }

    private matchAll(item: WebsiteContentCrawlerRawItem, regex: RegExp): string[] {
        const haystack = [item.markdown, item.text, item.title].filter(Boolean).join('\n');
        return haystack.match(regex) ?? [];
    }
}
