import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EnrichmentSource } from '@/generated/prisma';

export class EnrichLeadDto {
    @ApiPropertyOptional({ enum: EnrichmentSource, isArray: true })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(EnrichmentSource, { each: true })
    sources?: EnrichmentSource[];

    @ApiPropertyOptional({
        description: 'Use OpenAI Batch API for source summaries and combined enrichment (50% cheaper, up to 24h)',
    })
    @IsOptional()
    @IsBoolean()
    use_batch?: boolean;
}
