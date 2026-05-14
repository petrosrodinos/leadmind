import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ScoringInstructionsService } from './scoring-instructions.service';
import { ScoringInstructionsController } from './scoring-instructions.controller';

@Module({
    imports: [PrismaModule],
    controllers: [ScoringInstructionsController],
    providers: [ScoringInstructionsService],
    exports: [ScoringInstructionsService],
})
export class ScoringInstructionsModule {}
