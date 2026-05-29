import { ApiProperty } from '@nestjs/swagger';
import { ExternalIntegrationProvider } from '@/generated/prisma';
import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateIntegrationCredentialDto {
    @ApiProperty({ enum: ExternalIntegrationProvider })
    @IsEnum(ExternalIntegrationProvider)
    provider!: ExternalIntegrationProvider;

    @ApiProperty({
        example: 'api_key',
        description: 'Credential kind slug defined by the provider catalog',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(64)
    @Matches(/^[a-z][a-z0-9_]*$/)
    kind!: string;

    @ApiProperty({
        example: '1',
        description:
            'Account or workspace label. Use the same value to pair related credentials.',
        default: 'default',
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
