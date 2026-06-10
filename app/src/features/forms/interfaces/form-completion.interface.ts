import { FieldType } from './form.interface';

export interface CompletionValue {
    uuid: string;
    completion_uuid: string;
    field_uuid: string;
    value: string;
    field: {
        uuid: string;
        label: string;
        field_type: FieldType;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface FormCompletion {
    uuid: string;
    form_uuid: string;
    contact_uuid: string;
    completed_by_uuid: string;
    contact: {
        uuid: string;
        name: string | null;
        email: string | null;
        company: string | null;
    };
    values: CompletionValue[];
    created_at: string;
    updated_at: string;
}

export interface PaginatedCompletions {
    data: FormCompletion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ListCompletionsQuery {
    page?: number;
    limit?: number;
    contact_uuid?: string;
}

export interface CreateCompletionPayload {
    contact_uuid: string;
    values: { field_uuid: string; value: string }[];
}

export interface UpdateCompletionPayload {
    values: { field_uuid: string; value: string }[];
}

export interface ContactCompletionSummary {
    uuid: string;
    form_uuid: string;
    contact_uuid: string;
    completed_by_uuid: string;
    created_at: string;
    updated_at: string;
    form: {
        uuid: string;
        name: string;
    };
    _count: {
        values: number;
    };
}
