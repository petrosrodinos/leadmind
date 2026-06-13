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

export enum MeetingOutcome {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
    CANCELLED = 'CANCELLED',
    CLOSED_WON = 'CLOSED_WON',
    CLOSED_LOST = 'CLOSED_LOST',
}

export class LogMeetingDto {
    @ApiProperty({ enum: MeetingOutcome })
    @IsEnum(MeetingOutcome)
    outcome: MeetingOutcome;

    @ApiProperty({ description: 'When the meeting occurred or is scheduled (ISO datetime)' })
    @IsISO8601()
    occurred_at: string;

    @ApiPropertyOptional({ minimum: 0, maximum: 1440 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1440)
    duration_minutes?: number;

    @ApiPropertyOptional({ maxLength: 500, description: 'Freeform location: address, "Office", Zoom URL, etc.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    location?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    content?: string;
}
