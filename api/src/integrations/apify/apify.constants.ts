export const APIFY_API_BASE_URL = 'https://api.apify.com/v2';

export const APIFY_WAIT_FOR_FINISH_SECONDS = 300;

export const APIFY_MAX_RETRIES = 2;

export const APIFY_RETRY_DELAY_MS = 5000;

export const APIFY_ACTORS = {
    LINKEDIN_LEADS: 'purple_beep_boop/find-b2b-emails-for-outreach',
    GOOGLE_MAPS: 'compass/crawler-google-places',
    GOOGLE_SEARCH: 'apify/google-search-scraper',
    GENERIC_LEAD: 'braveleads/leads-finder-linkedin-apollo-leads-generator',
    WEBSITE_CONTENT_CRAWLER: 'apify/website-content-crawler',
    LINKEDIN_COMPANY: 'scraper-engine/linkedin-company-about-scraper',
} as const;

export type ApifyActorKey = keyof typeof APIFY_ACTORS;
