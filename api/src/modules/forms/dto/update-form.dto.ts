import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFormDto {
    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @ApiPropertyOptional({ maxLength: 2000 })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;
}
