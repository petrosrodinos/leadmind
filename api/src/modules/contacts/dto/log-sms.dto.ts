import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { CallDirection } from './log-call.dto';

export class LogSmsDto {
    @ApiProperty({ enum: CallDirection, default: CallDirection.OUTBOUND })
    @IsEnum(CallDirection)
    direction: CallDirection;

    @ApiPropertyOptional({ description: 'When the SMS was sent or received (ISO datetime). Defaults to now.' })
    @IsOptional()
    @IsISO8601()
    occurred_at?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;
}
