import Stripe from "stripe";

export type PaymentIntentWithCharges = Stripe.PaymentIntent & {
    charges: Stripe.ApiList<Stripe.Charge>;
};