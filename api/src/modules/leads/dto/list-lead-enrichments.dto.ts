import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EnrichmentSource } from '@/generated/prisma';

export class ListLeadEnrichmentsDto {
    @ApiPropertyOptional({ description: 'Filter by enrichment source' })
    @IsOptional()
    @IsEnum(EnrichmentSource)
    source?: EnrichmentSource;

    @ApiPropertyOptional({ description: 'Search in summary and source URL' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
