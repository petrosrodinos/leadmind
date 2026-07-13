import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTemplateFromSourceDto {
    @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    name?: string;
}
