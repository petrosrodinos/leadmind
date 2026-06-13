import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { ContactAudienceStatsService } from './contact-audience-stats.service';

@Module({
    imports: [PrismaModule, ContactsModule],
    providers: [ContactAudienceStatsService],
    exports: [ContactAudienceStatsService],
})
export class ContactAudienceStatsModule {}
