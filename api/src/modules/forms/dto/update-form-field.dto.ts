import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { FieldType } from '@/generated/prisma';

export class UpdateFormFieldDto {
    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    label?: string;

    @ApiPropertyOptional({ enum: FieldType })
    @IsOptional()
    @IsEnum(FieldType)
    field_type?: FieldType;

    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    placeholder?: string;

    @ApiPropertyOptional({ maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    help_text?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @ApiPropertyOptional({ maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    default_value?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @ApiPropertyOptional({ minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    order_index?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}
