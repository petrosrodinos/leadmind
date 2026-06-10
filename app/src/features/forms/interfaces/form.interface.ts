export type FieldType =
    | 'TEXT_INPUT'
    | 'TEXTAREA'
    | 'NUMBER_INPUT'
    | 'EMAIL_INPUT'
    | 'PHONE_INPUT'
    | 'DATE_INPUT'
    | 'CHECKBOX'
    | 'RADIO_GROUP'
    | 'DROPDOWN'
    | 'MULTI_SELECT_DROPDOWN'
    | 'LABEL'
    | 'SECTION_HEADER';

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT_INPUT: 'Text Input',
    TEXTAREA: 'Text Area',
    NUMBER_INPUT: 'Number',
    EMAIL_INPUT: 'Email',
    PHONE_INPUT: 'Phone',
    DATE_INPUT: 'Date',
    CHECKBOX: 'Checkbox',
    RADIO_GROUP: 'Radio Group',
    DROPDOWN: 'Dropdown',
    MULTI_SELECT_DROPDOWN: 'Multi-Select',
    LABEL: 'Label',
    SECTION_HEADER: 'Section Header',
};

export const FIELD_TYPES_WITH_OPTIONS: FieldType[] = [
    'DROPDOWN',
    'RADIO_GROUP',
    'MULTI_SELECT_DROPDOWN',
];

export const FIELD_TYPES_DISPLAY_ONLY: FieldType[] = ['LABEL', 'SECTION_HEADER'];

export interface FormField {
    uuid: string;
    form_uuid: string;
    label: string;
    field_type: FieldType;
    placeholder: string | null;
    help_text: string | null;
    required: boolean;
    default_value: string | null;
    options: string[] | null;
    order_index: number;
    enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface Form {
    uuid: string;
    user_uuid: string;
    name: string;
    description: string | null;
    fields: FormField[];
    created_at: string;
    updated_at: string;
    _count?: {
        completions: number;
        fields: number;
    };
}

export interface PaginatedForms {
    data: Form[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ListFormsQuery {
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreateFormPayload {
    name: string;
    description?: string;
}

export interface UpdateFormPayload {
    name?: string;
    description?: string;
}

export interface CreateFormFieldPayload {
    label: string;
    field_type: FieldType;
    placeholder?: string;
    help_text?: string;
    required?: boolean;
    default_value?: string;
    options?: string[];
    order_index?: number;
    enabled?: boolean;
}

export interface UpdateFormFieldPayload extends Partial<CreateFormFieldPayload> {}

export interface ReorderFormFieldsPayload {
    fields: { uuid: string; order_index: number }[];
}
