import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import {
    StripeProduct,
    StripePrice,
    UpdateProductRequest,
    UpdatePriceRequest,
    CreateProductRequest,
    CreatePriceRequest,
    ToggleProductAndPriceRequest,
} from '../interfaces/stripe-products.interface';
import { StripeConfig } from '../stripe.config';

@Injectable()
export class StripeProductsService {
    private stripe: Stripe;

    constructor(private stripeConfig: StripeConfig) {
        this.stripe = this.stripeConfig.getStripeClient();

    }

    async createProductAndPrice(payload: CreateProductRequest): Promise<{ product: StripeProduct, price: StripePrice }> {
        try {
            const { service, stripe_account_id, metadata } = payload;

            const product = await this.createProduct({ service, stripe_account_id, metadata });
            const price = await this.createPrice({ product_id: product.id, service, stripe_account_id, metadata });

            return {
                product,
                price,
            };
        }
        catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe product and price: ${error.message}`,
            );
        }
    }

    async createProduct(payload: CreateProductRequest): Promise<StripeProduct> {
        try {
            const { service, stripe_account_id, metadata } = payload;

            const product = await this.stripe.products.create({
                name: service.name,
                description: service.description,
                metadata: {
                    ...metadata,
                    account_uuid: service.account_uuid,
                    service_uuid: service.uuid,
                },
            },
                {
                    stripeAccount: stripe_account_id ?? undefined,
                }
            );

            return {
                id: product.id,
                name: product.name,
                description: product.description || undefined,
                active: product.active,
                created: product.created,
                metadata: product.metadata,
            };

        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe product: ${error.message}`,
            );
        }
    }

    async createPrice(payload: CreatePriceRequest): Promise<StripePrice> {
        try {
            const { product_id, service, stripe_account_id, currency, metadata } = payload;

            const stripePrice = await this.stripe.prices.create({
                product: product_id,
                unit_amount: service.price * 100,
                currency: currency ?? 'eur',
                metadata: {
                    ...metadata,
                    account_uuid: service.account_uuid,
                    service_uuid: service.uuid,
                },
            }, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            return {
                id: stripePrice.id,
                product_id: stripePrice.product as string,
                unit_amount: (stripePrice.unit_amount / 100) || 0,
                currency: stripePrice.currency,
                active: stripePrice.active,
                type: stripePrice.type as 'one_time' | 'recurring',
                created: stripePrice.created,
                metadata: stripePrice.metadata,
            };
        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe price: ${error.message}`,
            );
        }
    }

    async updateProduct(product_id: string, stripe_account_id: string | undefined, product: UpdateProductRequest): Promise<void> {
        try {
            if (!product_id) {
                return;
            }
            await this.stripe.products.update(product_id, {
                active: product.active,
                name: product.name,
                description: product.description,
                metadata: product.metadata,
            }, {
                stripeAccount: stripe_account_id ?? undefined,
            });
        } catch (error) {
            throw new BadRequestException(
                `Failed to update Stripe product: ${error.message}`,
            );
        }
    }

    async deleteProduct(product_id: string, stripe_account_id: string | undefined): Promise<void> {
        try {
            await this.stripe.products.del(product_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });
        } catch (error) {
            throw new BadRequestException(
                `Failed to delete Stripe product: ${error.message}`,
            );
        }
    }

    async toggleProductAndPrice(payload: ToggleProductAndPriceRequest): Promise<void> {
        try {
            const { product_id, price_id, active, stripe_account_id } = payload;

            if (!product_id || !price_id) {
                return;
            }
            await this.stripe.prices.update(price_id, { active: active }, { stripeAccount: stripe_account_id ?? undefined });
            await this.stripe.products.update(product_id, { active: active }, { stripeAccount: stripe_account_id ?? undefined });
        } catch (error) {
            throw new BadRequestException(
                `Failed to disable Stripe product and price: ${error.message}`,
            );
        }
    }

    async changePrice(payload: UpdatePriceRequest): Promise<string> {
        try {
            const { product_id, price_id, price, stripe_account_id, currency, service, metadata } = payload;

            await this.stripe.prices.update(price_id, {
                active: false,
            }, { stripeAccount: stripe_account_id ?? undefined });

            const newPrice = await this.stripe.prices.create({
                product: product_id,
                unit_amount: price * 100,
                currency: currency ?? 'eur',
                metadata: {
                    ...metadata,
                    account_uuid: service.account_uuid,
                    service_uuid: service.uuid,
                },
            }, { stripeAccount: stripe_account_id ?? undefined });

            return newPrice.id;
        } catch (error) {
            throw new BadRequestException(`Failed to change price: ${error.message}`);
        }
    }


    async getProduct(product_id: string, stripe_account_id: string | undefined): Promise<StripeProduct> {
        try {
            const product = await this.stripe.products.retrieve(product_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                active: product.active,
                created: product.created,
                metadata: product.metadata,
            };
        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve Stripe product: ${error.message}`,
            );
        }
    }

    async getPrice(price_id: string, stripe_account_id: string | undefined): Promise<StripePrice> {
        try {
            const price = await this.stripe.prices.retrieve(price_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            return {
                id: price.id,
                product_id: price.product as string,
                unit_amount: price.unit_amount || 0,
                currency: price.currency,
                active: price.active,
                type: price.type as 'one_time' | 'recurring',
                created: price.created,
                metadata: price.metadata,
            };
        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve Stripe price: ${error.message}`,
            );
        }
    }

    async listProducts(stripe_account_id?: string | undefined): Promise<StripeProduct[]> {
        try {
            const products = await this.stripe.products.list({
                limit: 50,
            }, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            return products.data
                .map((product) => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    active: product.active,
                    created: product.created,
                    metadata: product.metadata,
                }));
        } catch (error) {
            throw new BadRequestException(
                `Failed to list Stripe products: ${error.message}`,
            );
        }
    }

    async listPrices(product_id: string, stripe_account_id?: string | undefined): Promise<StripePrice[]> {
        try {

            const prices = await this.stripe.prices.list({
                product: product_id,
                limit: 50,
            }, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            return prices.data.map((price) => ({
                id: price.id,
                product_id: price.product as string,
                unit_amount: (price.unit_amount / 100) || 0,
                currency: price.currency,
                active: price.active,
                type: price.type as 'one_time' | 'recurring',
                created: price.created,
                metadata: price.metadata,
            }));
        } catch (error) {
            throw new BadRequestException(
                `Failed to list Stripe prices: ${error.message}`,
            );
        }
    }
}