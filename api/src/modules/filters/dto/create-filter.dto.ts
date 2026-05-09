import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';
import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { Channel, EnrichmentSource, SourceType } from '@/generated/prisma';
import { IsCronExpression } from '../validators/is-cron-expression.validator';

export class CreateFilterDto {
    @ApiProperty({ maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({ enum: SourceType })
    @IsEnum(SourceType)
    source_type: SourceType;

    @ApiProperty({ type: 'object', additionalProperties: true })
    @IsObject()
    query_config: Record<string, any>;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ example: '0 9 * * *' })
    @IsOptional()
    @IsString()
    @IsCronExpression()
    cron_schedule?: string;

    @ApiProperty({ enum: Channel, isArray: true })
    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(Channel, { each: true })
    channels: Channel[];

    @ApiPropertyOptional({ enum: EnrichmentSource, isArray: true })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsEnum(EnrichmentSource, { each: true })
    enrichment_sources?: EnrichmentSource[];

    @ApiPropertyOptional({ maxLength: 2000 })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    ai_instructions?: string;
}
