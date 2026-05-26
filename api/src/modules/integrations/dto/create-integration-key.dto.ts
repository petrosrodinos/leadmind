import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateIntegrationKeyDto {
    @ApiProperty({ maxLength: 120, example: 'Primary API key' })
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    title!: string;

    @ApiProperty({ description: 'Secret value (API key, token, etc.)' })
    @IsString()
    @MinLength(1)
    @MaxLength(4096)
    secret!: string;
}
