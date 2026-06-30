import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ApifyUsageController } from './apify-usage.controller';
import { ApifyUsageService } from './apify-usage.service';

@Module({
    imports: [PrismaModule],
    controllers: [ApifyUsageController],
    providers: [ApifyUsageService],
    exports: [ApifyUsageService],
})
export class ApifyUsageModule {}
