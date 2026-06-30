import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiUsageController } from './ai-usage.controller';
import { AiUsageService } from './ai-usage.service';

@Module({
    imports: [PrismaModule],
    controllers: [AiUsageController],
    providers: [AiUsageService],
    exports: [AiUsageService],
})
export class AiUsageModule {}
