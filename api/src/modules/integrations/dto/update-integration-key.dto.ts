import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateIntegrationKeyDto {
    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    title?: string;

    @ApiPropertyOptional({ description: 'New secret value' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(4096)
    secret?: string;
}
