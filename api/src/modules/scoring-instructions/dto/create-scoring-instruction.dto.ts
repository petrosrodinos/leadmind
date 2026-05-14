import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateScoringInstructionDto {
    @ApiProperty({ maxLength: 200 })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @ApiProperty({ description: 'Prompt text used when AI-scoring contacts' })
    @IsString()
    @MinLength(1)
    @MaxLength(20_000)
    instructions: string;
}
