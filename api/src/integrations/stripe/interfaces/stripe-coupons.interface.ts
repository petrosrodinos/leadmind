import Stripe from "stripe";

export interface StripeCoupon {
    id: string;
    name?: string;
    amount_off?: number;
    percent_off?: number;
    currency?: string;
    duration: StripeCouponDuration;
    duration_in_months?: number;
    max_redemptions?: number;
    redeem_by?: number;
    times_redeemed?: number;
    valid: boolean;
    applies_to?: {
        products?: string[];
    };
    created: number;
    metadata?: Record<string, string>;
}

export interface CreateCouponRequest {
    name?: string;
    amount_off?: number;
    percent_off?: number;
    currency?: string;
    duration?: StripeCouponDuration;
    duration_in_months?: number;
    max_redemptions?: number;
    redeem_by?: number;
    applies_to?: {
        products?: string[];
    };
    metadata?: Record<string, string>;
}

export interface UpdateCouponRequest {
    name?: string;
    metadata?: Record<string, string>;
}

export interface StripePromotionCode {
    id: string;
    code: string;
    active: boolean;
    max_redemptions?: number | null;
    times_redeemed: number;
    coupon: string;
    expires_at?: number | null;
    metadata?: Record<string, string>;
    restrictions?: Stripe.PromotionCode.Restrictions;
    created: number;
}

export interface CreatePromotionCodeRequest {
    coupon_id: string;
    code: string;
    max_redemptions?: number;
    expires_at?: number;
    restrictions?: Stripe.PromotionCode.Restrictions;
    metadata?: Record<string, string>;
}

export interface UpdatePromotionCodeRequest {
    active?: boolean;
    metadata?: Record<string, string>;
    restrictions?: Partial<Stripe.PromotionCode.Restrictions>;
}

export const StripeCouponDurations = {
    FOREVER: 'forever',
    ONCE: 'once',
    REPEATING: 'repeating',
} as const;

export type StripeCouponDuration = typeof StripeCouponDurations[keyof typeof StripeCouponDurations];

