export interface WebsiteContentCrawlerQueryConfig {
    start_urls: string[];
    max_crawl_depth?: number;
    max_crawl_pages?: number;
    max_results?: number;
    crawler_type?: 'playwright:adaptive' | 'playwright:firefox' | 'cheerio' | 'jsdom' | 'playwright:chrome';
    include_url_globs?: string[];
    exclude_url_globs?: string[];
}

export interface WebsiteContentCrawlerRawItem {
    url?: string;
    title?: string;
    text?: string;
    markdown?: string;
    html?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
}
