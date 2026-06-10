import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReminderStatus } from '@/generated/prisma';

export class CreateReminderDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    contact_uuid: string;

    @ApiPropertyOptional({ maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional({ maxLength: 5000 })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    notes?: string;

    @ApiProperty({ description: 'ISO 8601 datetime string' })
    @IsDateString()
    remind_at: string;

    @ApiPropertyOptional({ enum: ReminderStatus })
    @IsOptional()
    @IsEnum(ReminderStatus)
    status?: ReminderStatus;
}
