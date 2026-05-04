import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import {
    OnboardingLinkResponse,
    StripeConnectAccount,
    StripeConnectAccountDto,
} from '../interfaces/stripe-accounts.interface';
import { StripeConfig } from '../stripe.config';
import { ConfigService } from '@nestjs/config';
import { AppUrls } from '@/shared/config/app-urls';

@Injectable()
export class StripeAccountsService {
    private stripe: Stripe;
    private appUrl: string;

    constructor(private stripeConfig: StripeConfig, private configService: ConfigService) {
        this.stripe = this.stripeConfig.getStripeClient();
        this.appUrl = this.configService.get<string>('APP_URL');
    }

    async createConnectAccount(
        payload: StripeConnectAccountDto,
    ): Promise<StripeConnectAccount> {
        try {
            const stripeAccount = await this.stripe.accounts.create({
                type: 'express',
                country: payload.country,
                email: payload.email,
                business_type: 'individual',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    account_uuid: payload.account_uuid,
                    phone: payload.phone,
                    email: payload.email,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    country: payload.country,
                    city: payload.city,
                    address: payload.address,
                },
            });

            return {
                account_id: stripeAccount.id,
                charges_enabled: stripeAccount.charges_enabled,
                details_submitted: stripeAccount.details_submitted,
                payouts_enabled: stripeAccount.payouts_enabled,
                finished_onboarding: stripeAccount.charges_enabled && stripeAccount.payouts_enabled,
                capabilities: {
                    transfers: stripeAccount.capabilities?.transfers === "active",
                    card_payments: stripeAccount.capabilities?.card_payments === "active",
                }
            };

        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe Connect account: ${error.message}`,
            );
        }
    }

    async generateOnboardingLink(
        stripe_account_id: string,
    ): Promise<OnboardingLinkResponse> {
        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: stripe_account_id,
                refresh_url: AppUrls.billing,
                return_url: AppUrls.billing,
                type: 'account_onboarding',
            });

            return {
                object: accountLink.object,
                created: accountLink.created,
                expires_at: accountLink.expires_at,
                url: accountLink.url,
            };

        } catch (error) {
            throw new BadRequestException(
                `Failed to generate onboarding link: ${error.message}`,
            );
        }
    }

    async getConnectAccount(stripe_account_id: string): Promise<StripeConnectAccount> {
        try {
            const account = await this.stripe.accounts.retrieve(stripe_account_id, {
                expand: [
                    'individual',
                    'company',
                    'external_accounts',
                    'business_profile',
                    'requirements',
                ],
            });

            return {
                account_id: account.id,
                charges_enabled: account.charges_enabled,
                details_submitted: account.details_submitted,
                payouts_enabled: account.payouts_enabled,
                finished_onboarding: account.charges_enabled && account.payouts_enabled,
                individual: account.individual,
                company: account.company,
                external_accounts: account.external_accounts,
                business_profile: account.business_profile,
                requirements: account.requirements,
                capabilities: {
                    transfers: account.capabilities?.transfers === "active",
                    card_payments: account.capabilities?.card_payments === "active",
                }
            };

        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve Stripe Connect account: ${error.message}`,
            );
        }
    }

    async getAccountLoginLink(stripe_account_id: string): Promise<string> {

        try {

            const loginLink = await this.stripe.accounts.createLoginLink(stripe_account_id);

            if (!loginLink?.url) {
                throw new Error("Could not get login link");
            }

            return loginLink?.url;

        } catch (error) {
            throw new BadRequestException(
                `Failed to generate account login link: ${error.message}`,
            );
        }
    }

    async deleteConnectAccount(stripe_account_id: string): Promise<void> {

        if (!stripe_account_id) {
            return;
        }
        try {
            await this.stripe.accounts.del(stripe_account_id);
        } catch (error) {
            throw new BadRequestException(
                `Failed to delete Stripe Connect account: ${error.message}`,
            );
        }
    }

    async getConnectedBalance(stripe_account_id: string) {
        try {
            return this.stripe.balance.retrieve({}, { stripeAccount: stripe_account_id });
        } catch (error) {
            throw new error;
        }
    }

    async listBalanceTransactions(stripe_account_id: string, params = { limit: 50 }) {
        try {
            return this.stripe.balanceTransactions.list(params, { stripeAccount: stripe_account_id });
        } catch (error) {
            throw new error;
        }
    }

    async listCharges(stripe_account_id: string, params = { limit: 50 }) {
        try {
            return this.stripe.charges.list(params, { stripeAccount: stripe_account_id });
        } catch (error) {
            throw new error;
        }
    }

    async listPayouts(stripe_account_id: string, params = { limit: 50 }) {
        try {
            return this.stripe.payouts.list(params, { stripeAccount: stripe_account_id });
        } catch (error) {
            throw new error;
        }
    }

}
