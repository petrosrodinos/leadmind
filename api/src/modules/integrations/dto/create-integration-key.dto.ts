import { ApiProperty } from '@nestjs/swagger';
import { IntegrationKeyType } from '@/generated/prisma';
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateIntegrationKeyDto {
    @ApiProperty({ enum: IntegrationKeyType, example: IntegrationKeyType.API_KEY })
    @IsEnum(IntegrationKeyType)
    key_type!: IntegrationKeyType;

    @ApiProperty({
        example: '1',
        description:
            'Account label shared by related keys, e.g. RESEND_API_KEY_1 and RESEND_WEBHOOK_SECRET_1 both use account "1".',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(32)
    @Matches(/^[a-zA-Z0-9_-]+$/)
    account!: string;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(4096)
    secret!: string;
}
