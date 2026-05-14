import type { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { SourceType } from "@/features/leads/interfaces/lead.interface";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";

export const JobStatus = {
    PENDING: "PENDING",
    RUNNING: "RUNNING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const JobTrigger = {
    MANUAL: "MANUAL",
    SCHEDULED: "SCHEDULED",
} as const;

export type JobTrigger = (typeof JobTrigger)[keyof typeof JobTrigger];

export interface LinkedInQueryConfig {
    keywords: string;
    seniority?: string[];
    departments?: string[];
    location?: string[];
    company_location?: string[];
    companyIndustries?: string[];
    company_size?: string[];
    company_revenue?: string[];
    limit?: number;
    only_with_email?: boolean;
}

export interface GoogleMapsQueryConfig {
    query: string;
    location?: string;
    limit?: number;
}

export type ManualQueryConfig = Record<string, never>;

export type QueryConfig =
    | LinkedInQueryConfig
    | GoogleMapsQueryConfig
    | ManualQueryConfig
    | Record<string, unknown>;

export interface Filter {
    uuid: string;
    user_uuid: string;
    name: string;
    source_type: SourceType;
    query_config: QueryConfig;
    enrichment_sources?: EnrichmentSource[];
    enabled: boolean;
    cron_schedule: string | null;
    channels: Channel[];
    scoring_instructions: Array<{
        uuid: string;
        name: string;
        instructions: string;
    }>;
    outreach_instructions: string | null;
    created_at: string;
    updated_at: string;
}

export interface FilterJob {
    uuid: string;
    filter_uuid: string;
    status: JobStatus;
    trigger: JobTrigger;
    leads_found: number;
    duration: number;
    error: string | null;
    started_at: string;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateFilterPayload {
    name: string;
    source_type: SourceType;
    query_config: QueryConfig;
    enrichment_sources?: EnrichmentSource[];
    enabled?: boolean;
    cron_schedule?: string;
    channels: Channel[];
    scoring_instruction_uuids?: string[];
    outreach_instructions?: string;
}

export type UpdateFilterPayload = Partial<CreateFilterPayload>;

export interface ListFilterJobsQuery {
    page?: number;
    limit?: number;
}

export interface PaginatedFilterJobs {
    items: FilterJob[];
    total: number;
    page: number;
    limit: number;
}

export interface ManualRunResponse {
    queue_job_id: string;
    filter_uuid: string;
    status: "queued";
}
