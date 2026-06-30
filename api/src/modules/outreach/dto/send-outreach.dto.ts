import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel } from '@/generated/prisma';
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { EMAIL_DELIVERY_PROVIDERS } from './email-provider.dto';

export class SendOutreachDto {
    @ApiProperty({ enum: Channel })
    @IsEnum(Channel)
    channel: Channel;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    content: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    subject?: string;

    @ApiProperty()
    @IsUUID()
    contact_uuid: string;

    @ApiPropertyOptional({ description: 'ISO datetime for delayed sending' })
    @IsOptional()
    @IsDateString()
    scheduled_at?: string;

    @ApiPropertyOptional({ enum: EMAIL_DELIVERY_PROVIDERS })
    @IsOptional()
    @IsIn(EMAIL_DELIVERY_PROVIDERS)
    email_provider?: (typeof EMAIL_DELIVERY_PROVIDERS)[number];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    email_account?: string;
}
