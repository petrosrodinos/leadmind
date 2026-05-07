export type WebsiteCrawlerType =
    | 'playwright:adaptive'
    | 'playwright:firefox'
    | 'cheerio'
    | 'jsdom'
    | 'playwright:chrome';

export type WebsiteHtmlTransformer =
    | 'readableTextIfPossible'
    | 'readableText'
    | 'extractus'
    | 'defuddle'
    | 'none';

export interface WebsiteCookie {
    name: string;
    value: string;
    path?: string;
    domain?: string;
    [key: string]: any;
}

export interface WebsiteProxyConfiguration {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
    proxyUrls?: string[];
}

export interface WebsiteContentCrawlerQueryConfig {
    // crawling boundaries
    start_urls: string[];
    include_url_globs?: string[];
    exclude_url_globs?: string[];
    max_crawl_depth?: number;
    max_crawl_pages?: number;
    max_results?: number;
    use_sitemaps?: boolean;
    use_llms_txt?: boolean;
    respect_robots_txt?: boolean;
    keep_url_fragments?: boolean;
    ignore_canonical_url?: boolean;

    // crawler engine
    crawler_type?: WebsiteCrawlerType;

    // network
    proxy_configuration?: WebsiteProxyConfiguration;
    initial_cookies?: WebsiteCookie[];
    custom_http_headers?: Record<string, string>;
    sign_http_requests?: boolean;
    ignore_https_errors?: boolean;
    request_timeout_secs?: number;
    min_file_download_speed_kbps?: number;

    // concurrency / retries
    initial_concurrency?: number;
    max_concurrency?: number;
    max_request_retries?: number;
    max_session_rotations?: number;

    // browser-only behavior
    dynamic_content_wait_secs?: number;
    wait_for_selector?: string;
    soft_wait_for_selector?: string;
    max_scroll_height_pixels?: number;
    remove_cookie_warnings?: boolean;
    block_media?: boolean;
    expand_iframes?: boolean;
    click_elements_css_selector?: string;
    sticky_container_css_selector?: string;
    page_function?: string;

    // content extraction
    keep_elements_css_selector?: string;
    remove_elements_css_selector?: string;
    html_transformer?: WebsiteHtmlTransformer;
    readable_text_char_threshold?: number;
    aggressive_prune?: boolean;

    // output formats
    save_html?: boolean;
    save_html_as_file?: boolean;
    save_markdown?: boolean;
    save_files?: boolean;
    save_content_types?: string;
    save_screenshots?: boolean;

    // adaptive crawler tuning
    client_side_min_change_percentage?: number;
    rendering_type_detection_percentage?: number;
    reuse_stored_detection_results?: boolean;

    // debug
    debug_mode?: boolean;
    debug_log?: boolean;
    store_skipped_urls?: boolean;
}

export interface WebsiteContentCrawlerRawItem {
    url?: string;
    loadedUrl?: string;
    title?: string;
    text?: string;
    markdown?: string;
    html?: string;
    htmlUrl?: string;
    screenshotUrl?: string;
    metadata?: Record<string, any>;
    depth?: number;
    crawl?: { loadedUrl?: string; loadedTime?: string };
    debug?: Record<string, any>;
    [key: string]: any;
}

export interface CrawledPage {
    url: string;
    title?: string;
    text?: string;
    markdown?: string;
    html?: string;
    html_url?: string;
    screenshot_url?: string;
    metadata?: Record<string, any>;
    depth?: number;
}

export interface ExtractedContact {
    url: string;
    emails: string[];
    linkedin_urls: string[];
    phones: string[];
    title?: string;
}

export interface CrawlSinglePageOptions
    extends Omit<WebsiteContentCrawlerQueryConfig, 'start_urls' | 'max_crawl_depth' | 'max_crawl_pages' | 'max_results'> {
    /** Defaults to 1. */
    timeout_secs?: number;
}
