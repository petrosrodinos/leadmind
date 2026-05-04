import {
    Controller,
    Post,
    Get,
    UseGuards,
    Delete,
    Param,
    Headers,
    Req,
    Body,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtGuard } from '../../shared/guards/jwt.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { AuthRoles } from '../auth/interfaces/auth.interface';


@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('accounts')
    @UseGuards(JwtGuard)
    async createConnectAccount(
        @CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.createConnectAccount(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('accounts/onboarding-link')
    @UseGuards(JwtGuard)
    async generateOnboardingLink(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.generateOnboardingLink(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('accounts')
    @UseGuards(JwtGuard)
    async getConnectAccount(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.getConnectAccount(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('accounts/login-link')
    @UseGuards(JwtGuard)
    async getAccountLoginLink(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.getAccountLoginLink(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Delete('accounts')
    @UseGuards(JwtGuard)
    async deleteConnectAccount(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.deleteConnectAccount(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('customers/billing-portal')
    @UseGuards(JwtGuard)
    async createBillingPortalSession(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.createBillingPortalSession(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('customers')
    @UseGuards(JwtGuard)
    async getCustomer(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.getCustomer(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Get('customers/payment-methods')
    @UseGuards(JwtGuard)
    async getPaymentMethods(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.getPaymentMethods(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Post('customers/payment-intent')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(AuthRoles.ADMIN)
    async createPaymentIntent(@CurrentUser('account_uuid') account_uuid: string) {
        try {
            return await this.stripeService.createPaymentIntent(account_uuid);
        } catch (error) {
            throw error;
        }
    }

    @Post('customers/payment-methods/default')
    @UseGuards(JwtGuard)
    async setDefaultPaymentMethod(@CurrentUser('account_uuid') account_uuid: string, @Body('payment_method_id') payment_method_id: string) {
        try {
            return await this.stripeService.setDefaultPaymentMethod(account_uuid, payment_method_id);
        } catch (error) {
            throw error;
        }
    }

    @Delete('customers/payment-methods/:payment_method_id')
    @UseGuards(JwtGuard)
    async deletePaymentMethod(@CurrentUser('account_uuid') account_uuid: string, @Param('payment_method_id') payment_method_id: string) {
        try {
            return await this.stripeService.deletePaymentMethod(account_uuid, payment_method_id);
        } catch (error) {
            throw error;
        }
    }

    @Post('webhooks')
    async webhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
        const rawBody = req.body as Buffer;
        return this.stripeService.webhook(rawBody, signature);
    }
}
