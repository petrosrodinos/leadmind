import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeConfig } from '../stripe.config';
import { StripeSessionResponse, StripeFee, StripePaymentIntentResponse, StripeChargeResponse, StripePaymentContext, CreateStripeCheckoutSession } from '../interfaces/stripe-payments.interface';
import { AppUrls } from '@/shared/config/app-urls';

@Injectable()
export class StripePaymentsService {
    private stripe: Stripe;

    constructor(private stripeConfig: StripeConfig) {
        this.stripe = this.stripeConfig.getStripeClient();
    }

    async createCheckoutSession(payload: CreateStripeCheckoutSession): Promise<Stripe.Response<Stripe.Checkout.Session>> {

        const { stripe_account_id, price_id, booking_uuid, client_email, platform_fee, allow_promotion_codes, stripe_promotion_code_id, promotion_code_uuid } = payload;

        const session = await this.stripe.checkout.sessions.create(
            {
                payment_method_types: ["card"],
                customer_email: client_email,
                line_items: [
                    {
                        price: price_id,
                        quantity: 1,
                    },
                ],
                discounts: stripe_promotion_code_id ? [
                    {
                        promotion_code: stripe_promotion_code_id,
                    },
                ] : undefined,
                mode: "payment",
                payment_intent_data: {
                    application_fee_amount: platform_fee ? platform_fee : undefined,
                    transfer_data: {
                        destination: stripe_account_id,
                    },
                    metadata: {
                        booking_uuid: booking_uuid,
                        stripe_account_id: stripe_account_id,
                        context: StripePaymentContext.BOOKING_PAYMENT,
                    },
                },
                metadata: {
                    booking_uuid: booking_uuid,
                    stripe_account_id: stripe_account_id,
                    context: StripePaymentContext.BOOKING_PAYMENT,
                    promotion_code_uuid: promotion_code_uuid ? promotion_code_uuid : null,
                },
                success_url: undefined,
                cancel_url: undefined,
            }
        );

        return session;
    }

    async getPaymentIntent(payment_intent_id: string): Promise<StripePaymentIntentResponse> {

        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(payment_intent_id, {
                expand: ["charges"],
            });

            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                charges: paymentIntent.latest_charge ? [{
                    id: (paymentIntent.latest_charge as Stripe.Charge).id,
                    amount: (paymentIntent.latest_charge as Stripe.Charge).amount,
                    receipt_url: (paymentIntent.latest_charge as Stripe.Charge).receipt_url,
                    payment_method: (paymentIntent.latest_charge as Stripe.Charge).payment_method as string | null,
                }] : [],
            };
        } catch (error) {
            throw new BadRequestException("Failed to get payment intent");
        }
    }

    async getSession(session_id: string): Promise<StripeSessionResponse> {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(session_id, {
                expand: ["payment_intent", "payment_intent.latest_charge"],
            });

            if (!session.payment_intent || typeof session.payment_intent === "string") {
                throw new BadRequestException("No payment intent found for this session");
            }

            const pi = session.payment_intent as Stripe.PaymentIntent;

            return {
                session: {
                    id: session.id,
                    status: session.status as "open" | "complete" | "expired",
                    amount_total: session.amount_total ?? 0,
                    currency: session.currency ?? "usd",
                    customer: session.customer as string | null,
                    payment_intent_id: pi.id,
                },
                paymentIntent: {
                    id: pi.id,
                    status: pi.status,
                    amount: pi.amount,
                    currency: pi.currency,
                    charges: pi.latest_charge ? [{
                        id: (pi.latest_charge as Stripe.Charge).id,
                        amount: (pi.latest_charge as Stripe.Charge).amount,
                        receipt_url: (pi.latest_charge as Stripe.Charge).receipt_url,
                        payment_method: (pi.latest_charge as Stripe.Charge).payment_method as string | null,
                    }] : [],
                },
            };
        } catch (error) {
            throw new BadRequestException("Failed to get session");
        }
    }

    async getCharge(charge_id: string, stripe_account_id?: string): Promise<StripeChargeResponse> {
        try {

            const charge = await this.stripe.charges.retrieve(
                charge_id,
                {},
                stripe_account_id ? { stripeAccount: stripe_account_id } : undefined
            );

            return {
                id: charge.id,
                amount: charge.amount,
                amount_captured: charge.amount_captured,
                amount_refunded: charge.amount_refunded,
                receipt_url: charge.receipt_url,
                application_fee_amount: charge.application_fee_amount,
                balance_transaction: charge.balance_transaction as string | null,
                currency: charge.currency,
                created: charge.created,
                status: charge.status,
                payment_intent: charge.payment_intent as string | null,
                payment_method: charge.payment_method,
            }
        } catch (error) {
            throw new BadRequestException("Failed to get charge");
        }
    }

    async getTransfer(transfer_id: string, stripe_account_id?: string): Promise<any> {
        try {
            const transfer = await this.stripe.transfers.retrieve(transfer_id, stripe_account_id ? { stripeAccount: stripe_account_id } : undefined);

            return transfer
        } catch (error) {
            throw new BadRequestException("Failed to get transfer");
        }
    }

    async refundPayment(charge_id: string): Promise<Stripe.Response<Stripe.Refund>> {
        try {
            return await this.stripe.refunds.create({
                charge: charge_id,
                reason: "requested_by_customer",
            });
        } catch (error) {
            throw new BadRequestException("Failed to refund payment");
        }
    }

    async getStripeFee(balance_transaction_id: string, stripe_account_id?: string): Promise<StripeFee> {

        try {

            if (!balance_transaction_id) {
                return {
                    fee: 0,
                    net: 0,
                };
            }

            const bt = await this.stripe.balanceTransactions.retrieve(
                balance_transaction_id,
                stripe_account_id ? { stripeAccount: stripe_account_id } : undefined
            );

            return {
                fee: bt.fee,
                net: bt.net,
            };
        } catch (error) {
            return {
                fee: 0,
                net: 0,
            };
        }
    }

    async getAccountChargeFees(charge_id: string, stripe_account_id?: string) {

        try {

            const accountCharge = await this.stripe.charges.retrieve(
                charge_id,
                { expand: ['balance_transaction'] }
            );

            const balanceTx = accountCharge.balance_transaction;

            if (typeof balanceTx === 'object' && balanceTx !== null) {
                return {
                    fee: balanceTx.fee ?? 0,
                    net: balanceTx.net ?? 0,
                    amount: balanceTx.amount ?? 0,
                };
            }

            return {
                fee: 0,
                net: 0,
                amount: 0,
            };

        } catch (error) {
            console.error('Failed to get account charge fees', error);
            return {
                fee: 0,
                net: 0,
                amount: 0,
            };
        }
    }

    async getBalanceTransaction(balance_transaction: any) {
        try {

            const balanceTransaction =
                typeof balance_transaction === "object"
                    ? balance_transaction
                    : await this.stripe.balanceTransactions.retrieve(
                        balance_transaction as string
                    );

            return {
                fee: balanceTransaction.fee ?? 0,
                net: balanceTransaction.net ?? 0,
                amount: balanceTransaction.amount ?? 0,
            };
        } catch (error) {
            throw new BadRequestException("Failed to get balance transaction");
        }
    }


}