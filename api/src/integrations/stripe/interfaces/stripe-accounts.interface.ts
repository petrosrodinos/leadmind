export interface StripeConnectAccountDto {
    account_uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    city: string;
    address: string;
}

export interface StripeConnectAccount {
    account_id: string;
    charges_enabled: boolean;
    details_submitted: boolean;
    payouts_enabled: boolean;
    finished_onboarding: boolean;
    individual?: any;
    company?: any;
    external_accounts?: any;
    business_profile?: any;
    requirements?: any;
    capabilities: {
        transfers?: boolean;
        card_payments?: boolean;
        payouts?: boolean;
    };
}


export interface OnboardingLinkResponse {
    object: string;
    created: number;
    expires_at: number;
    url: string;
}

