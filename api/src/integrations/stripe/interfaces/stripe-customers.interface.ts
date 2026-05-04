export interface StripeCustomer {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, string>;
    default_payment_method: string;
}

export interface CreateCustomerRequest {
    name?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, string>;
}

export interface UpdateCustomerRequest {
    name?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, string>;
}

export interface StripePaymentMethod {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    default: boolean;
}

export interface StripePayment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    description: string;
}

export interface StripeInvoice {
    id: string;
    amount_due: number;
    currency: string;
    status: string;
    invoice_pdf: string;
}

export interface CreatePaymentIntentRequest {
    account_uuid: string;
    customer_id: string;
    amount: number;
    currency?: string;
    description?: string;
    payment_method_id?: string;
}
