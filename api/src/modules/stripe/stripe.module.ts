import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeIntegrationModule } from '@/integrations/stripe/stripe.module';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';

@Module({
    imports: [StripeIntegrationModule, PrismaModule],
    controllers: [StripeController],
    providers: [StripeService],
})
export class StripeModule { }
