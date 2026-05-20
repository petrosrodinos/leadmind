export interface UtmParams {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
}

export interface SenderProfile {
    uuid: string;
    user_uuid: string;
    name: string;
    company_name: string | null;
    title: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    website_utm: UtmParams | null;
    address: string | null;
    city: string | null;
    country: string | null;
    logo_url: string | null;
    booking_url: string | null;
    booking_utm: UtmParams | null;
    sender_id: string | null;
    signature: string | null;
    business_description: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateSenderProfilePayload {
    name: string;
    company_name?: string;
    title?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    website?: string;
    website_utm?: UtmParams | null;
    address?: string;
    city?: string;
    country?: string;
    logo_url?: string;
    booking_url?: string;
    booking_utm?: UtmParams | null;
    sender_id?: string;
    signature?: string;
    business_description?: string;
    is_default?: boolean;
}

export type UpdateSenderProfilePayload = Partial<CreateSenderProfilePayload>;
