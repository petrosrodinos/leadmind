import { ApiProperty } from '@nestjs/swagger';
import { ExternalIntegrationProvider } from '@/generated/prisma';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export const EMAIL_DELIVERY_PROVIDERS = [
    ExternalIntegrationProvider.RESEND,
    ExternalIntegrationProvider.SMTP,
] as const;

export type EmailDeliveryProvider = (typeof EMAIL_DELIVERY_PROVIDERS)[number];

export class EmailProviderTargetDto {
    @ApiProperty({ enum: EMAIL_DELIVERY_PROVIDERS })
    @IsIn(EMAIL_DELIVERY_PROVIDERS)
    provider: EmailDeliveryProvider;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    account: string;
}

export class EmailProviderAllocationDto extends EmailProviderTargetDto {
    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    count: number;
}

export class SendExistingMessageDto {
    @ApiProperty({ enum: EMAIL_DELIVERY_PROVIDERS, required: false })
    @IsOptional()
    @IsIn(EMAIL_DELIVERY_PROVIDERS)
    email_provider?: EmailDeliveryProvider;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    email_account?: string;
}
