import { PartialType } from '@nestjs/swagger';
import { CreateScoringInstructionDto } from './create-scoring-instruction.dto';

export class UpdateScoringInstructionDto extends PartialType(CreateScoringInstructionDto) {}
