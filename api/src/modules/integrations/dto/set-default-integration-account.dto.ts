import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SetDefaultIntegrationAccountDto {
    @ApiProperty({
        example: '1',
        description:
            'Account label for the default credential set, e.g. keys with account "1" for RESEND or SMTP.',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(32)
    @Matches(/^[a-zA-Z0-9_-]+$/)
    account!: string;
}
