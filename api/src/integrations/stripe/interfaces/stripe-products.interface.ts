export interface StripeProduct {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    created: number;
    metadata?: Record<string, string>;
}

export interface StripePrice {
    id: string;
    product_id: string;
    unit_amount: number;
    currency: string;
    active: boolean;
    type: 'one_time' | 'recurring';
    created: number;
    metadata?: Record<string, string>;
}

export interface ServiceData {
    name: string;
    description?: string;
    account_uuid: string;
    uuid: string;
    price: number;
}

export interface CreateProductRequest {
    service: ServiceData;
    stripe_account_id?: string;
    metadata?: Record<string, string>;
}

export interface CreatePriceRequest {
    product_id: string;
    service: ServiceData;
    stripe_account_id?: string;
    currency?: string;
    metadata?: Record<string, string>;
}

export interface UpdatePriceRequest {
    product_id: string;
    price_id: string;
    price: number;
    service: ServiceData;
    stripe_account_id?: string;
    currency?: string;
    metadata?: Record<string, string>;
}

export interface UpdateProductRequest {
    active?: boolean;
    name?: string;
    description?: string;
    metadata?: Record<string, string>;
}

export interface ToggleProductAndPriceRequest {
    product_id: string;
    price_id: string;
    active: boolean;
    stripe_account_id?: string;
}