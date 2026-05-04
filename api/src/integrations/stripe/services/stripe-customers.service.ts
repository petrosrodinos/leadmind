import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeConfig } from '../stripe.config';
import {
    StripeCustomer,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CreatePaymentIntentRequest,
    StripePaymentMethod,
    StripeInvoice,
    StripePayment,
} from '../interfaces/stripe-customers.interface';
import { StripePaymentContext } from '../interfaces/stripe-payments.interface';

@Injectable()
export class StripeCustomersService {
    private stripe: Stripe;

    constructor(private stripeConfig: StripeConfig) {
        this.stripe = this.stripeConfig.getStripeClient();
    }


    async createCustomer(data: CreateCustomerRequest): Promise<StripeCustomer> {
        try {
            const customer = await this.stripe.customers.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                metadata: data.metadata,
            });

            return this.mapCustomer(customer);
        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe customer: ${error.message}`,
            );
        }
    }


    async updateCustomer(
        customer_id: string,
        data: UpdateCustomerRequest,
    ): Promise<StripeCustomer> {
        try {
            const customer = await this.stripe.customers.update(customer_id, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                metadata: data.metadata,
            });

            return this.mapCustomer(customer);
        } catch (error) {
            throw new BadRequestException(
                `Failed to update Stripe customer: ${error.message}`,
            );
        }
    }


    async getCustomer(customer_id: string): Promise<StripeCustomer> {
        try {
            const customer = await this.stripe.customers.retrieve(customer_id, {
                expand: ['invoice_settings.default_payment_method'],
            });

            if (customer.deleted) {
                throw new BadRequestException('Customer has been deleted');
            }

            return this.mapCustomer(customer as Stripe.Customer);
        } catch (error) {
            throw new BadRequestException(
                `Failed to get Stripe customer: ${error.message}`,
            );
        }
    }


    async deleteCustomer(customer_id: string): Promise<void> {
        try {
            await this.stripe.customers.del(customer_id);
        } catch (error) {
            throw new BadRequestException(
                `Failed to delete Stripe customer: ${error.message}`,
            );
        }
    }

    async createPaymentIntent(
        data: CreatePaymentIntentRequest,
    ): Promise<Stripe.PaymentIntent> {
        try {

            const customer = await this.getCustomer(data.customer_id);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: data.amount * 100,
                currency: data.currency || 'eur',
                customer: data.customer_id,
                payment_method: customer.default_payment_method,
                confirm: true,
                off_session: true,
                description: data.description,
                metadata: {
                    context: StripePaymentContext.PROVIDER_PAYMENT,
                    account_uuid: data.account_uuid,
                },
            });

            return paymentIntent;
        } catch (error: any) {
            throw new BadRequestException(error?.message ?? 'Failed to create payment intent');
        }
    }

    async createBillingPortalSession(
        customer_id: string,
        return_url: string,
    ): Promise<{ url: string }> {
        try {
            const session = await this.stripe.billingPortal.sessions.create({
                customer: customer_id,
                return_url,
            });

            return { url: session.url };
        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe billing portal session: ${error.message}`,
            );
        }
    }

    async getPaymentMethods(customer_id: string): Promise<StripePaymentMethod[]> {
        try {
            const methods = await this.stripe.paymentMethods.list({
                customer: customer_id,
                type: 'card',
            });

            const customer = await this.getCustomer(customer_id);

            return methods.data.map(m => ({
                id: m.id,
                brand: m.card?.brand,
                last4: m.card?.last4,
                default: m.id === (customer?.default_payment_method ?? ''),
                exp_month: m.card?.exp_month,
                exp_year: m.card?.exp_year,
            }));
        } catch (error) {
            throw new BadRequestException(
                `Failed to get Stripe payment methods: ${error.message}`,
            );
        }
    }

    async setDefaultPaymentMethod(customer_id: string, payment_method_id: string): Promise<void> {
        try {
            await this.stripe.customers.update(customer_id, {
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });
        } catch (error) {
            throw new BadRequestException(
                `Failed to set default payment method: ${error.message}`,
            );
        }
    }

    async deletePaymentMethod(payment_method_id: string): Promise<void> {
        try {
            await this.stripe.paymentMethods.detach(payment_method_id);
        } catch (error) {
            throw new BadRequestException(
                `Failed to delete payment method: ${error.message}`,
            );
        }
    }

    async getPayments(customer_id: string): Promise<StripePayment[]> {
        try {
            const charges = await this.stripe.charges.list({ customer: customer_id, limit: 10 });
            return charges.data.map(c => ({
                id: c.id,
                amount: c.amount,
                currency: c.currency,
                status: c.status,
                created: c.created,
                description: c.description,
            }));
        } catch (error) {
            throw new BadRequestException(
                `Failed to get Stripe payments: ${error.message}`,
            );
        }
    }

    async getInvoices(customer_id: string): Promise<StripeInvoice[]> {
        try {
            const invoices = await this.stripe.invoices.list({ customer: customer_id, limit: 10 });
            return invoices.data.map(i => ({
                id: i.id,
                amount_due: i.amount_due,
                currency: i.currency,
                status: i.status,
                invoice_pdf: i.invoice_pdf,
            }));
        } catch (error) {
            throw new BadRequestException(
                `Failed to get Stripe invoices: ${error.message}`,
            );
        }
    }


    private mapCustomer(customer: Stripe.Customer): StripeCustomer {
        return {
            id: customer.id,
            name: customer.name ?? undefined,
            email: customer.email ?? undefined,
            phone: customer.phone ?? undefined,
            metadata: customer.metadata ?? {},
            default_payment_method: (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod)?.id ?? undefined,
        };
    }
}
