import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UtmParamsDto {
    @ApiPropertyOptional({ maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    source?: string;

    @ApiPropertyOptional({ maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    medium?: string;

    @ApiPropertyOptional({ maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    campaign?: string;

    @ApiPropertyOptional({ maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    term?: string;

    @ApiPropertyOptional({ maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    content?: string;
}
