import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsISO8601,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export enum CallOutcome {
    CONNECTED = 'CONNECTED',
    NO_ANSWER = 'NO_ANSWER',
    VOICEMAIL = 'VOICEMAIL',
    BUSY = 'BUSY',
}

export enum CallDirection {
    OUTBOUND = 'OUTBOUND',
    INBOUND = 'INBOUND',
}

export class LogCallDto {
    @ApiProperty({ enum: CallOutcome })
    @IsEnum(CallOutcome)
    outcome: CallOutcome;

    @ApiProperty({ enum: CallDirection, default: CallDirection.OUTBOUND })
    @IsEnum(CallDirection)
    direction: CallDirection;

    @ApiPropertyOptional({ minimum: 0, maximum: 1440 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1440)
    duration_minutes?: number;

    @ApiPropertyOptional({ description: 'When the call occurred (ISO datetime). Defaults to now.' })
    @IsOptional()
    @IsISO8601()
    occurred_at?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;
}
