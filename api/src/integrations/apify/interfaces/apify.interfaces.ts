export type ApifyRunInput = Record<string, any>;

export interface NormalizedLead {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    google_maps_url?: string;
    linkedin_url?: string;
    title?: string;
    location?: string;
    industry?: string;
    description?: string;
    raw_data: Record<string, any>;
}

export interface ApifyAdapter<TQueryConfig = unknown, TRawItem = any> {
    buildInput(query_config: TQueryConfig): ApifyRunInput;
    normalize(raw_items: TRawItem[]): NormalizedLead[];
}
