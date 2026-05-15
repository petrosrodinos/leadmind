import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
