import { LeadStatus } from '@/generated/prisma';

export interface SearchQuery {
    q?: string;
    status?: LeadStatus;
    min_score?: number;
    source_type?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export interface SearchResult<T = any> {
    hits: T[];
    total: number;
}
