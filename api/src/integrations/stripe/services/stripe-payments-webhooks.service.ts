import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeConfig } from '../stripe.config';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { PaymentIntentWithCharges } from '../interfaces/stripe-webhooks.interface';
import { StripePaymentsService } from './stripe-payments.service';
import { StripePaymentContext } from '../interfaces/stripe-payments.interface';

@Injectable()
export class StripePaymentsWebhooksService {
    private stripe: Stripe;
    private webhookSecret: string;
    private relativeEvents: Set<string>;

    constructor(
        private stripeConfig: StripeConfig,
        private configService: ConfigService,
        private prisma: PrismaService,
        private stripePaymentsService: StripePaymentsService,
    ) {
        this.stripe = this.stripeConfig.getStripeClient();
        this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        this.relativeEvents = this.stripeConfig.getRelativeEvents();
    }


    async handleStripeWebhook(body: any, signature: string) {

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(body, signature, this.webhookSecret);
        } catch (err: any) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        // if (!this.relativeEvents.has(event.type) || !event) {
        //     return;
        // }

        try {

            switch (event.type) {

                case "checkout.session.completed": {
                    const session = event.data.object as Stripe.Checkout.Session;

                    const bookingUuid = session.metadata?.booking_uuid;
                    if (!bookingUuid) {
                        return;
                    }

                    if (session.mode !== "payment") return;

                    const paymentIntent = (await this.stripe.paymentIntents.retrieve(
                        session.payment_intent as string,
                        { expand: ["latest_charge.balance_transaction"] },
                    )) as unknown as PaymentIntentWithCharges;


                    // await this.prisma.payment.updateMany({
                    //     where: {
                    //         OR: [
                    //             { stripe_session_id: session.id },
                    //             { booking_uuid: bookingUuid }
                    //         ]
                    //     },
                    //     data: {
                    //         stripe_payment_intent: session?.payment_intent as string,
                    //     },
                    // });

                    // if (paymentIntent.status === "succeeded") {
                    //     await this.prisma.booking.updateMany({
                    //         where: { uuid: bookingUuid, status: { not: BookingStatus.CONFIRMED } },
                    //         data: { status: BookingStatus.CONFIRMED },
                    //     });
                    // }

                    break;
                }

                case 'setup_intent.succeeded': {
                    const setupIntent = event.data.object as Stripe.SetupIntent;

                    const customerId = setupIntent.customer as string;
                    const paymentMethodId = setupIntent.payment_method as string;

                    if (!customerId || !paymentMethodId) break;

                    try {
                        // await this.prisma.account.update({
                        //     where: {
                        //         stripe_customer_id: customerId,
                        //         OR: [
                        //             { stripe_payment_method_id: null },
                        //             { stripe_payment_method_id: '' },
                        //         ]
                        //     },
                        //     data: {
                        //         stripe_payment_method_id: paymentMethodId,
                        //     },
                        // });
                    } catch (error) {
                    }

                    break;
                }

                case 'customer.updated': {
                    const customer = event.data.object as Stripe.Customer;

                    const defaultPaymentMethod = customer?.invoice_settings?.default_payment_method as string;

                    if (!defaultPaymentMethod) break;

                    try {
                        // await this.prisma.account.update({
                        //     where: { stripe_customer_id: customer.id },
                        //     data: { stripe_payment_method_id: defaultPaymentMethod },
                        // });
                    } catch (error) {
                        console.error('Failed to update default payment method:', error.message);
                    }
                }

                case 'payment_method.detached': {
                    const paymentMethod = event.data.object as Stripe.PaymentMethod;
                    try {
                        // await this.prisma.account.updateMany({
                        //     where: { stripe_payment_method_id: paymentMethod.id },
                        //     data: { stripe_payment_method_id: null },
                        // });
                    } catch (error) {
                        console.error('Failed to detach payment method:', error.message);
                    }
                    break;
                }

                case "charge.succeeded": {
                    const charge = event.data.object as Stripe.Charge;

                    if (!charge.payment_intent) break;

                    // Provider payment flow
                    if (charge.metadata?.context === StripePaymentContext.PROVIDER_PAYMENT) {
                        const account_uuid = charge.metadata?.account_uuid;

                        if (!account_uuid) break;

                        if (charge.customer && charge.payment_method) {
                            const amount = charge.amount_captured;
                            try {
                                // const netAmount = (amount) - (amount * CreditsCosts.CreditsPurchaseFee);
                                // await this.prisma.account.update({
                                //     where: {
                                //         uuid: account_uuid,
                                //     },
                                //     data: {
                                //         credits: {
                                //             increment: netAmount / 100,
                                //         },
                                //         stripe_payment_method_id: charge.payment_method as string,
                                //     },
                                // });

                                // await this.prisma.payment.create({
                                //     data: {
                                //         amount: netAmount,
                                //         payout_amount: amount,
                                //         platform_fee_amount: charge.application_fee_amount,
                                //         currency: charge.currency,
                                //         provider_uuid: account_uuid,
                                //         payment_context: PaymentContext.CREDITS,
                                //         stripe_charge_id: charge.id,
                                //         stripe_payment_intent: charge.payment_intent as string,
                                //         stripe_receipt_url: charge.receipt_url as string,
                                //         status: PaymentStatus.SUCCEEDED,
                                //     },
                                // });
                            } catch (error) {
                                console.error('Failed to attach payment method:', error.message);
                            }

                        }

                        break;
                    }

                    // Bookings flow
                    if (charge.metadata?.context === StripePaymentContext.BOOKING_PAYMENT) {

                        const { booking_uuid, promotion_code_uuid } = charge.metadata;

                        if (!booking_uuid) break;

                        // await this.prisma.payment.updateMany({
                        //     where: { booking_uuid: charge.metadata?.booking_uuid as string },
                        //     data: {
                        //         stripe_charge_id: charge.id,
                        //         status: PaymentStatus.SUCCEEDED,
                        //         payout_amount: charge.amount_captured,
                        //         stripe_receipt_url: charge.receipt_url as string,
                        //     },
                        // });


                        // const booking = await this.prisma.booking.update({
                        //     where: { uuid: booking_uuid },
                        //     data: { status: BookingStatus.CONFIRMED },
                        //     include: {
                        //         service: true,
                        //         provider: true,
                        //         client: true,
                        //     },
                        // });

                        // if (promotion_code_uuid) {
                        //     const promotionCode = await this.prisma.promotionCode.update({
                        //         where: { uuid: promotion_code_uuid },
                        //         data: { times_redeemed: { increment: 1 } },
                        //     });

                        //     await this.prisma.coupon.update({
                        //         where: { uuid: promotionCode.coupon_uuid },
                        //         data: { times_redeemed: { increment: 1 } },
                        //     });
                        // }

                        try {


                        } catch (error) {
                            console.error('Failed to send booking creation email:', error);
                        }
                    }

                    break;
                }

                case "charge.failed": {
                    const charge = event.data.object as Stripe.Charge;

                    if (!charge.payment_intent) break;

                    const context = charge.metadata?.context;

                    const amount = charge.amount ?? 0;
                    // const netAmount = (amount) - (amount * CreditsCosts.CreditsPurchaseFee);

                    if (context === StripePaymentContext.PROVIDER_PAYMENT) {
                        const account_uuid = charge.metadata?.account_uuid;
                        if (!account_uuid) break;
                        // await this.prisma.payment.create({
                        //     data: {
                        //         amount: netAmount,
                        //         payout_amount: amount,
                        //         platform_fee_amount: charge.application_fee_amount,
                        //         currency: charge.currency,
                        //         provider_uuid: account_uuid,
                        //         payment_context: PaymentContext.CREDITS,
                        //         stripe_charge_id: charge.id,
                        //         stripe_payment_intent: charge.payment_intent as string,
                        //         status: PaymentStatus.FAILED,
                        //         message: charge.failure_message as string,
                        //     },
                        // });
                        break;
                    }
                }

                case "charge.updated":

                    const updatedCharge = event.data.object as Stripe.Charge;

                    const { fee } = await this.stripePaymentsService.getBalanceTransaction(updatedCharge.balance_transaction);

                    const platformFee = (updatedCharge.application_fee_amount ?? 0);
                    const totalFee = fee + platformFee;
                    const net = (updatedCharge.amount_captured ?? 0) - totalFee;

                    const booking_uuid = updatedCharge.metadata?.booking_uuid;

                    if (!booking_uuid) break;

                    // await this.prisma.payment.updateMany({
                    //     where: { booking_uuid: booking_uuid },
                    //     data: {
                    //         stripe_fee_amount: fee,
                    //         platform_fee_amount: platformFee,
                    //         total_fee_amount: totalFee,
                    //         net_amount: net,
                    //     },
                    // });

                    const price = Number((net / 100).toFixed(2));

                    // await this.prisma.booking.update({
                    //     where: { uuid: booking_uuid },
                    //     data: { price }
                    // });

                    break;

                case "charge.refunded": {
                    const charge = event.data.object as Stripe.Charge;
                    // await this.prisma.payment.updateMany({
                    //     where: { stripe_charge_id: charge.id },
                    //     data: { status: PaymentStatus.REFUNDED },
                    // });
                    break;
                }

                case "payment_intent.payment_failed": {
                    const pi = event.data.object as Stripe.PaymentIntent;
                    const context = pi.metadata?.context;

                    if (context === StripePaymentContext.BOOKING_PAYMENT) {
                        const booking_uuid = pi.metadata?.booking_uuid;
                        if (!booking_uuid) break;

                        // await this.prisma.payment.updateMany({
                        //     where: { booking_uuid: booking_uuid },
                        //     data: { status: PaymentStatus.FAILED },
                        // });
                    }
                    break;
                }

                default:
                    break;
            }
        } catch (err) {
            console.error("Stripe webhook error:", err);
            throw err;
        }
    }


}