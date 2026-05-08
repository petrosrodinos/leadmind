export const SourceType = {
    LINKEDIN: "LINKEDIN",
    GOOGLE_MAPS: "GOOGLE_MAPS",
    GOOGLE_SEARCH: "GOOGLE_SEARCH",
    GENERIC_LEAD: "GENERIC_LEAD",
    WEBSITE_CRAWLER: "WEBSITE_CRAWLER",
    GEMI: "GEMI",
    MANUAL: "MANUAL",
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export interface Lead {
    uuid: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    website: string | null;
    linkedin_url: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    description: string | null;
    source_type: SourceType;
    enrichment_data: Record<string, unknown> | null;
    raw_data: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface ListLeadsQuery {
    page?: number;
    limit?: number;
    search?: string;
    source_type?: SourceType;
}

export interface PaginatedLeads {
    data: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
