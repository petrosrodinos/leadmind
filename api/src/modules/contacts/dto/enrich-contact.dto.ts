import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayUnique,
    IsArray,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { EnrichmentSource } from '@/generated/prisma';

export class EnrichContactDto {
    @ApiPropertyOptional({ enum: EnrichmentSource, isArray: true })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(EnrichmentSource, { each: true })
    sources?: EnrichmentSource[];
}
