import { Injectable } from '@nestjs/common';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import {
    WebsiteContentCrawlerQueryConfig,
    WebsiteContentCrawlerRawItem,
} from './website-content-crawler.interfaces';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const LINKEDIN_REGEX = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company|pub)\/[A-Za-z0-9_\-%/]+/gi;
const PHONE_REGEX = /\+?\d[\d\s().-]{7,}\d/g;

@Injectable()
export class WebsiteContentCrawlerAdapter
    implements ApifyAdapter<WebsiteContentCrawlerQueryConfig, WebsiteContentCrawlerRawItem> {

    buildInput(query_config: WebsiteContentCrawlerQueryConfig): ApifyRunInput {
        const {
            start_urls,
            max_crawl_depth,
            max_crawl_pages,
            max_results,
            crawler_type,
            include_url_globs,
            exclude_url_globs,
        } = query_config;

        const input: ApifyRunInput = {
            startUrls: start_urls.map((url) => ({ url })),
            crawlerType: crawler_type ?? 'playwright:firefox',
            proxyConfiguration: { useApifyProxy: true },
            maxCrawlDepth: max_crawl_depth ?? 2,
            maxCrawlPages: max_crawl_pages ?? 50,
            maxResults: max_results ?? 50,
            saveMarkdown: true,
        };

        if (include_url_globs?.length) {
            input.includeUrlGlobs = include_url_globs.map((glob) => ({ glob }));
        }
        if (exclude_url_globs?.length) {
            input.excludeUrlGlobs = exclude_url_globs.map((glob) => ({ glob }));
        }

        return input;
    }

    normalize(raw_items: WebsiteContentCrawlerRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item) => this.mapItem(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));
    }

    private mapItem(item: WebsiteContentCrawlerRawItem): NormalizedLead {
        const haystack = [item.markdown, item.text, item.title].filter(Boolean).join('\n');

        const email = haystack.match(EMAIL_REGEX)?.[0];
        const linkedin_url = haystack.match(LINKEDIN_REGEX)?.[0];
        const phone = haystack.match(PHONE_REGEX)?.[0]?.trim();

        return {
            name: item.title || undefined,
            email,
            phone,
            website: item.url || undefined,
            linkedin_url,
            description: item.title || undefined,
            raw_data: item,
        };
    }
}
