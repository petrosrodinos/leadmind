import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StripeAccountsService } from '@/integrations/stripe/services/stripe-accounts..service';
import { StripeProductsService } from '@/integrations/stripe/services/stripe-products.service';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { StripePaymentsWebhooksService } from '@/integrations/stripe/services/stripe-payments-webhooks.service';
import { StripeCustomersService } from '@/integrations/stripe/services/stripe-customers.service';
import { AppUrls } from '@/shared/config/app-urls';

@Injectable()
export class StripeService {
    constructor(
        private readonly stripeAccountsService: StripeAccountsService,
        private readonly stripeProductsService: StripeProductsService,
        private readonly stripePaymentsWebhooksService: StripePaymentsWebhooksService,
        private readonly stripeCustomersService: StripeCustomersService,
        private readonly prisma: PrismaService,
    ) { }

    async createConnectAccount(account_uuid: string) {
        try {

            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (account.stripe_account_id) {
                throw new BadRequestException('Account already has a stripe account');
            }

            if (account.stripe_customer_id) {
                throw new BadRequestException('Account already has a stripe customer');
            }

            const stripeAccount = await this.stripeAccountsService.createConnectAccount(
                account,
            );

            const stripeCustomer = await this.stripeCustomersService.createCustomer({
                name: `${account.first_name} ${account.last_name}`,
                email: account.email,
                phone: account.phone,
                metadata: {
                    account_uuid: account_uuid,
                },
            });

            await this.prisma.account.update({
                where: { uuid: account_uuid },
                data: {
                    stripe_account_id: stripeAccount.account_id,
                    stripe_customer_id: stripeCustomer.id,
                },
            });

            const onboardingLink = await this.stripeAccountsService.generateOnboardingLink(
                stripeAccount.account_id,
            );

            return {
                onboarding_link: onboardingLink,
                stripeAccount: stripeAccount,
            };


        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async generateOnboardingLink(account_uuid: string) {
        try {

            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_account_id) {
                throw new NotFoundException('Account not found');
            }

            return await this.stripeAccountsService.generateOnboardingLink(
                account.stripe_account_id,
            );

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getConnectAccount(account_uuid: string) {
        try {

            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account) {
                throw new NotFoundException('Account not found');
            }

            if (!account.stripe_account_id) {
                return null;
            }

            return await this.stripeAccountsService.getConnectAccount(account.stripe_account_id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getAccountLoginLink(account_uuid: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_account_id) {
                throw new NotFoundException('Account not found');
            }

            const loginLink = await this.stripeAccountsService.getAccountLoginLink(account.stripe_account_id);

            return {
                url: loginLink,
            }

        } catch (error) {
            throw new BadRequestException(error.message);
        }

    }

    async deleteConnectAccount(account_uuid: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_account_id) {
                throw new NotFoundException('Account not found');
            }

            await this.stripeAccountsService.deleteConnectAccount(account.stripe_account_id);

            if (!account.stripe_customer_id) {
                throw new NotFoundException('Stripe customer not found');
            }

            await this.stripeCustomersService.deleteCustomer(account.stripe_customer_id);

            await this.prisma.account.update({
                where: { uuid: account_uuid },
                data: {
                    stripe_account_id: null,
                    stripe_customer_id: null,
                    stripe_payment_method_id: null,
                },
            });

            return {
                message: 'Stripe Connect account deleted successfully',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async createBillingPortalSession(account_uuid: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_customer_id) {
                throw new NotFoundException('Account or Stripe customer not found');
            }

            const session = await this.stripeCustomersService.createBillingPortalSession(account.stripe_customer_id, AppUrls.billing);

            return session;

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getCustomer(account_uuid: string) {
        try {

            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_customer_id) {
                throw new NotFoundException('Account or Stripe customer not found');
            }

            return await this.stripeCustomersService.getCustomer(account.stripe_customer_id);


        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async getPaymentMethods(account_uuid: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_customer_id) {
                throw new NotFoundException('Account or Stripe customer not found');
            }

            return await this.stripeCustomersService.getPaymentMethods(account.stripe_customer_id);

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async createPaymentIntent(account_uuid: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_customer_id || !account.stripe_payment_method_id) {
                throw new NotFoundException('Account or Stripe customer or payment method not found');
            }

            const paymentIntent = await this.stripeCustomersService.createPaymentIntent({
                account_uuid: account_uuid,
                amount: 100,
                currency: 'eur',
                customer_id: account.stripe_customer_id,
                payment_method_id: account.stripe_payment_method_id,
            });

            return paymentIntent;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async setDefaultPaymentMethod(account_uuid: string, payment_method_id: string) {
        try {
            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });

            if (!account || !account.stripe_customer_id) {
                throw new NotFoundException('Account or Stripe customer not found');

            }

            await this.stripeCustomersService.setDefaultPaymentMethod(account.stripe_customer_id, payment_method_id);

            return {
                message: 'Default payment method set successfully',
            };

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async deletePaymentMethod(account_uuid: string, payment_method_id: string) {
        try {

            const account = await this.prisma.account.findUnique({
                where: { uuid: account_uuid },
            });


            if (!account || !account.stripe_customer_id) {
                throw new NotFoundException('Account or Stripe customer not found');
            }

            const paymentMethods = await this.stripeCustomersService.getPaymentMethods(account.stripe_customer_id);

            if (!paymentMethods.some(pm => pm.id === payment_method_id)) {
                throw new NotFoundException('Payment method not found');
            }

            await this.stripeCustomersService.deletePaymentMethod(payment_method_id);

            await this.prisma.account.updateMany({
                where: { uuid: account_uuid, stripe_payment_method_id: payment_method_id },
                data: { stripe_payment_method_id: null },
            });

            return {
                message: 'Payment method deleted successfully',
            };

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    async webhook(body: any, signature: string) {
        try {
            return await this.stripePaymentsWebhooksService.handleStripeWebhook(body, signature);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
