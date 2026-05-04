import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeAccountsService } from './services/stripe-accounts..service';
import { StripeProductsService } from './services/stripe-products.service';
import { StripeConfig } from './stripe.config';
import { StripePaymentsService } from './services/stripe-payments.service';
import { StripePaymentsWebhooksService } from './services/stripe-payments-webhooks.service';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { StripeCustomersService } from './services/stripe-customers.service';
import { StripeCouponsService } from './services/stripe-coupons.service';

@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [StripeConfig, StripeAccountsService, StripeProductsService, StripePaymentsService, StripePaymentsWebhooksService, StripeCustomersService, StripeCouponsService],
    exports: [StripeConfig, StripeAccountsService, StripeProductsService, StripePaymentsService, StripePaymentsWebhooksService, StripeCustomersService, StripeCouponsService],
})
export class StripeIntegrationModule { }
