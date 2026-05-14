import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class TriggerScoreDto {
    @ApiPropertyOptional({
        type: [String],
        description:
            'Scoring instruction UUIDs to rescore (must be attached to the contact filter). Omit or leave empty to rescore all.',
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    scoring_instruction_uuids?: string[];
}
