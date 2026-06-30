import type { ApifyUsageOperation } from "@/features/apify-usage/interfaces/apify-usage.interface";

export const APIFY_USAGE_OPERATION_LABELS: Record<ApifyUsageOperation, string> = {
    FILTER_SCRAPE: "Filter scrape",
    ENRICHMENT_LINKEDIN: "LinkedIn enrich",
    ENRICHMENT_WEBSITE: "Website enrich",
    ENRICHMENT_GOOGLE_SEARCH: "Google Search enrich",
    CONTACT_EMAIL_SCRAPE: "Contact email scrape",
    AI_WEBSITE_CONTEXT: "AI website context",
    OTHER: "Other",
};

export const APIFY_ACTOR_LABELS: Record<string, string> = {
    "purple_beep_boop/find-b2b-emails-for-outreach": "LinkedIn leads",
    "compass/crawler-google-places": "Google Maps",
    "apify/google-search-scraper": "Google Search",
    "braveleads/leads-finder-linkedin-apollo-leads-generator": "Generic lead finder",
    "apify/website-content-crawler": "Website crawler",
    "harvestapi/linkedin-company": "LinkedIn company",
    "dev_fusion/linkedin-profile-scraper": "LinkedIn profile",
};

export const APIFY_ACTOR_FILTER_OPTIONS = Object.entries(APIFY_ACTOR_LABELS).map(([key, label]) => ({
    key,
    label,
}));
