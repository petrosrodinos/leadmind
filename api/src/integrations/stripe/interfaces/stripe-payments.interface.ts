import Stripe from "stripe";

export interface CreateStripeCheckoutSession {
  account_uuid: string;
  stripe_account_id: string;
  price_id: string;
  booking_uuid: string;
  client_email: string;
  platform_fee?: number | null;
  allow_promotion_codes?: boolean;
  stripe_promotion_code_id?: string;
  promotion_code_uuid?: string;
}

export interface CheckoutSessionDTO {
  id: string;
  status: "open" | "complete" | "expired";
  amount_total: number;
  currency: string;
  customer: string | null;
  payment_intent_id: string;
}

export interface PaymentIntentDTO {
  id: string;
  status: Stripe.PaymentIntent.Status;
  amount: number;
  currency: string;
  charges: {
    id: string;
    amount: number;
    receipt_url: string | null;
    payment_method: string | null;
  }[];
}

export interface StripePaymentIntentResponse {
  id: string;
  status: Stripe.PaymentIntent.Status;
  amount: number;
  currency: string;
  charges: {
    id: string;
    amount: number;
    receipt_url: string | null;
    payment_method: string | null;
  }[];
}

export interface StripeChargeResponse {
  id: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  receipt_url: string | null;
  application_fee_amount: number | null;
  balance_transaction: string | null;
  currency: string;
  created: number;
  status: Stripe.Charge.Status;
  payment_intent: string | null;
  payment_method: string | null;
}

export interface StripeTransferResponse {
  id: string;
  amount: number;
  currency: string;
  created: number;
}


export interface StripeSessionResponse {
  session: CheckoutSessionDTO;
  paymentIntent: PaymentIntentDTO;
}

export interface StripeFee {
  fee: number;
  net: number;
}

export const StripePaymentContext = {
  PROVIDER_PAYMENT: 'PROVIDER_PAYMENT',
  BOOKING_PAYMENT: 'BOOKING_PAYMENT',
} as const;

export type StripePaymentContext = typeof StripePaymentContext[keyof typeof StripePaymentContext];