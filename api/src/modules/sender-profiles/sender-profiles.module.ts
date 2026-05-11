import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { SenderProfilesController } from './sender-profiles.controller';
import { SenderProfilesService } from './sender-profiles.service';

@Module({
    imports: [PrismaModule],
    controllers: [SenderProfilesController],
    providers: [SenderProfilesService],
    exports: [SenderProfilesService],
})
export class SenderProfilesModule { }
