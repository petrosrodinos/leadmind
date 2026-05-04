import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';


@Injectable()
export class StripeConfig {
    private stripeClient: any;
    private readonly logger = new Logger(StripeConfig.name);

    constructor(private readonly configService: ConfigService) {
        this.initStripe();
    }

    private initStripe() {
        try {
            const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

            if (!secretKey) {
                throw new Error('Stripe secret key is required');
            }

            this.stripeClient = new Stripe(secretKey, {
                apiVersion: '2025-12-15.clover',
            });

            this.logger.debug('Stripe initialized');
        } catch (error) {
            this.logger.error('Stripe not initialized');
        }

    }

    private relativeEvents() {
        return new Set([
            'checkout.session.completed',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'payment_intent.succeeded',
            'charge.succeeded',
            'charge.refunded',
            'payment_intent.payment_failed',
            'setup_intent.succeeded',
            'customer.updated',
            'charge.updated'
        ]);
    }

    getStripeClient(): Stripe {
        return this.stripeClient;
    }

    getRelativeEvents(): Set<string> {
        return this.relativeEvents();
    }

}