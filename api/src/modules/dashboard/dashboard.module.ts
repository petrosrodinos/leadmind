import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [PrismaModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
