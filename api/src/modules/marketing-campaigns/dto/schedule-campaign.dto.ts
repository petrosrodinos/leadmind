import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ScheduleCampaignDto {
    @ApiProperty({ description: 'ISO datetime for when the campaign should dispatch' })
    @IsDateString()
    scheduled_at: string;
}
