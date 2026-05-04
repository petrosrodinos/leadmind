import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeConfig } from '../stripe.config';
import {
    StripeCoupon,
    CreateCouponRequest,
    UpdateCouponRequest,
    StripePromotionCode,
    UpdatePromotionCodeRequest,
    CreatePromotionCodeRequest,
} from '../interfaces/stripe-coupons.interface';

@Injectable()
export class StripeCouponsService {
    private stripe: Stripe;

    constructor(private stripeConfig: StripeConfig) {
        this.stripe = this.stripeConfig.getStripeClient();
    }

    async createCoupon(
        stripe_account_id: string | undefined,
        data: CreateCouponRequest,
    ): Promise<StripeCoupon> {
        try {
            const coupon = await this.stripe.coupons.create(
                {
                    name: data.name,
                    amount_off: data.amount_off ? data.amount_off * 100 : undefined,
                    percent_off: data.percent_off,
                    currency: data.currency ?? 'eur',
                    duration: data.duration ?? undefined,
                    duration_in_months: data.duration_in_months ?? undefined,
                    max_redemptions: data.max_redemptions ?? undefined,
                    redeem_by: data.redeem_by ?? undefined,
                    applies_to: data.applies_to,
                    metadata: data.metadata,
                },
                { stripeAccount: stripe_account_id ?? undefined },
            );

            return this.mapCoupon(coupon);
        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe coupon: ${error.message}`,
            );
        }
    }

    async getCoupon(
        coupon_id: string,
        stripe_account_id: string | undefined,
    ): Promise<StripeCoupon> {
        try {
            const coupon = await this.stripe.coupons.retrieve(coupon_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            if (coupon?.deleted ?? false) {
                throw new BadRequestException(`Coupon ${coupon_id} has been deleted`);
            }

            return this.mapCoupon(coupon);
        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve Stripe coupon: ${error.message}`,
            );
        }
    }

    async updateCoupon(
        coupon_id: string,
        stripe_account_id: string | undefined,
        data: UpdateCouponRequest,
    ): Promise<void> {
        try {
            await this.stripe.coupons.update(
                coupon_id,
                {
                    name: data.name,
                    metadata: data.metadata,
                },
                { stripeAccount: stripe_account_id ?? undefined },
            );
        } catch (error) {
            throw new BadRequestException(
                `Failed to update Stripe coupon: ${error.message}`,
            );
        }
    }

    async deleteCoupon(
        coupon_id: string,
        stripe_account_id: string | undefined,
    ): Promise<void> {
        try {
            await this.stripe.coupons.del(coupon_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });
        } catch (error) {
            throw new BadRequestException(
                `Failed to delete Stripe coupon: ${error.message}`,
            );
        }
    }

    async listCoupons(
        stripe_account_id?: string | undefined,
    ): Promise<StripeCoupon[]> {
        try {
            const coupons = await this.stripe.coupons.list(
                { stripeAccount: stripe_account_id ?? undefined },
            );

            return coupons.data.map(this.mapCoupon);
        } catch (error) {
            throw new BadRequestException(
                `Failed to list Stripe coupons: ${error.message}`,
            );
        }
    }


    async enableCouponForProduct(
        coupon_id: string,
        product_id: string,
        stripe_account_id: string | undefined,
    ): Promise<StripeCoupon> {
        try {
            const existing = await this.stripe.coupons.retrieve(coupon_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });

            if (existing?.deleted ?? false) {
                throw new BadRequestException(`Coupon ${coupon_id} has been deleted`);
            }

            const currentProducts = existing.applies_to?.products ?? [];

            if (currentProducts.includes(product_id)) {
                return this.mapCoupon(existing);
            }

            const newCoupon = await this.stripe.coupons.create(
                {
                    name: existing.name,
                    amount_off: existing.amount_off,
                    percent_off: existing.percent_off,
                    currency: existing.currency,
                    duration: existing.duration,
                    duration_in_months: existing.duration_in_months ?? undefined,
                    max_redemptions: existing.max_redemptions ?? undefined,
                    redeem_by: existing.redeem_by ?? undefined,
                    metadata: existing.metadata ?? {},
                    applies_to: {
                        products: [...currentProducts, product_id],
                    },
                },
                { stripeAccount: stripe_account_id ?? undefined },
            );

            //   await this.stripe.coupons.del(coupon_id, {
            //     stripeAccount: stripe_account_id ?? undefined,
            //   });

            return this.mapCoupon(newCoupon);
        } catch (error) {
            throw new BadRequestException(
                `Failed to enable coupon for product: ${error.message}`,
            );
        }
    }


    async createPromotionCode(
        stripe_account_id: string | undefined,
        data: CreatePromotionCodeRequest,
    ): Promise<StripePromotionCode> {
        try {

            const promo = await this.stripe.promotionCodes.create(
                {
                    promotion: {
                        type: 'coupon',
                        coupon: data.coupon_id,
                    },
                    code: data.code,
                    max_redemptions: data.max_redemptions || undefined,
                    expires_at: data.expires_at || undefined,
                    restrictions: data.restrictions,
                    metadata: data.metadata,
                },
                {
                    stripeAccount: stripe_account_id ?? undefined,
                },
            );

            return this.mapPromotionCode(promo);
        } catch (error) {
            throw new BadRequestException(
                `Failed to create Stripe promotion code: ${error.message}`,
            );
        }
    }


    async getPromotionCode(
        promotion_code_id: string,
        stripe_account_id?: string,
    ): Promise<StripePromotionCode> {
        try {
            const promo = await this.stripe.promotionCodes.retrieve(promotion_code_id, {
                stripeAccount: stripe_account_id ?? undefined,
            });
            return this.mapPromotionCode(promo);
        } catch (error) {
            throw new BadRequestException(
                `Failed to retrieve promotion code: ${error.message}`,
            );
        }
    }


    async getPromotionCodes(
        stripe_account_id?: string,
        filters?: { active?: boolean; coupon?: string },
    ): Promise<StripePromotionCode[]> {
        try {
            const promotions = await this.stripe.promotionCodes.list(
                {
                    active: filters?.active,
                    coupon: filters?.coupon,
                },
                {
                    stripeAccount: stripe_account_id ?? undefined,
                },
            );

            return promotions.data.map(this.mapPromotionCode);
        } catch (error) {
            throw new BadRequestException(
                `Failed to list promotion codes: ${error.message}`,
            );
        }
    }


    async updatePromotionCode(
        promotion_code_id: string,
        data: UpdatePromotionCodeRequest,
        stripe_account_id?: string,
    ): Promise<StripePromotionCode> {
        try {
            const promo = await this.stripe.promotionCodes.update(
                promotion_code_id,
                {
                    active: data.active,
                    metadata: data.metadata,
                    restrictions: data.restrictions,
                },
                {
                    stripeAccount: stripe_account_id ?? undefined,
                },
            );
            return this.mapPromotionCode(promo);
        } catch (error) {
            throw new BadRequestException(
                `Failed to update promotion code: ${error.message}`,
            );
        }
    }


    async deactivatePromotionCode(
        promotion_code_id: string,
        stripe_account_id?: string,
    ): Promise<StripePromotionCode> {
        try {
            const promo = await this.stripe.promotionCodes.update(
                promotion_code_id,
                { active: false },
                { stripeAccount: stripe_account_id ?? undefined },
            );
            return this.mapPromotionCode(promo);
        } catch (error) {
            throw new BadRequestException(
                `Failed to deactivate promotion code: ${error.message}`,
            );
        }
    }


    private mapPromotionCode(promo: Stripe.PromotionCode): StripePromotionCode {
        let couponId = '';
        if (promo.promotion && typeof promo.promotion === 'object' && 'coupon' in promo.promotion) {
            const coupon = promo.promotion.coupon;
            couponId = typeof coupon === 'string' ? coupon : coupon.id;
        }

        return {
            id: promo.id,
            code: promo.code,
            active: promo.active,
            max_redemptions: promo.max_redemptions,
            times_redeemed: promo.times_redeemed,
            coupon: couponId,
            expires_at: promo.expires_at,
            metadata: promo.metadata ?? {},
            restrictions: promo.restrictions,
            created: promo.created,
        };
    }

    private mapCoupon(coupon: Stripe.Coupon): StripeCoupon {
        return {
            id: coupon.id,
            name: coupon.name ?? undefined,
            amount_off: coupon.amount_off ? coupon.amount_off / 100 : undefined,
            percent_off: coupon.percent_off ?? undefined,
            currency: coupon.currency ?? undefined,
            duration: coupon.duration,
            duration_in_months: coupon.duration_in_months ?? undefined,
            max_redemptions: coupon.max_redemptions ?? undefined,
            redeem_by: coupon.redeem_by ?? undefined,
            times_redeemed: coupon.times_redeemed ?? undefined,
            valid: coupon.valid,
            applies_to: coupon.applies_to ?? undefined,
            created: coupon.created,
            metadata: coupon.metadata ?? {},
        };
    }
}
