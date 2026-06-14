import type {
    ContactAudienceAnalysisScope,
    ContactAudienceAnalysisStatus,
} from '@/generated/prisma';
import type { ContactAudienceStats } from './contact-audience-stats.interface';
import type { ContactAudienceAnalysisContent } from '../schemas/contact-audience-analysis.schema';

export interface ContactAudienceAnalysisRecord {
    uuid: string;
    scope: ContactAudienceAnalysisScope;
    filter_uuid: string | null;
    contact_list_uuid: string | null;
    audience_name: string;
    stats_snapshot: ContactAudienceStats;
    analysis: ContactAudienceAnalysisContent | Record<string, never>;
    status: ContactAudienceAnalysisStatus;
    error: string | null;
    provider: string | null;
    model: string | null;
    input_tokens: number | null;
    output_tokens: number | null;
    cost_usd: number | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedContactAudienceAnalyses {
    items: ContactAudienceAnalysisRecord[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}
