export interface GoogleSearchQueryConfig {
    queries: string | string[];
    results_per_page?: number;
    max_pages_per_query?: number;
    country_code?: string;
    language_code?: string;
}

export interface GoogleSearchOrganicResult {
    title?: string;
    url?: string;
    description?: string;
    snippet?: string;
    [key: string]: any;
}

export interface GoogleSearchRawItem {
    searchQuery?: { term?: string };
    organicResults?: GoogleSearchOrganicResult[];
    paidResults?: GoogleSearchOrganicResult[];
    [key: string]: any;
}
